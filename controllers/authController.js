const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("./handlerFactory");
const sendEmail = require("./../utils/sendEmail");
const crypto = require("crypto");
const { jwtVerify } = require("jose");

const createToken = async (user, expiresIn) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  return token;
};

exports.googleAuth = catchAsync(async (req, res, next) => {
  let user = await User.findOne({ email: req.user.email });

  if (user) {
    if (!user.googleId) {
      user.googleId = req.user.googleId;
      await user.save({ validateBeforeSave: false });
    }
  } else user = await User.create(req.user);

  const token = createToken(user, "7d");

  sendResponse(200, user, res, token);
});

exports.facebookAuth = catchAsync(async (req, res, next) => {
  let user = await User.findOne({ email: req.user.email });

  if (user) {
    if (!user.facebookId) {
      user.facebookId = req.user.facebookId;
      user.gender = user.gender || req.user.gender;
      user.birthDate = user.birthDate || new Date(req.user.birthDate);
      user.location = user.location || req.user.location;
      await user.save({ validateBeforeSave: false });
    }
  } else {
    user = await User.create(req.user);
  }

  const token = await createToken(user, "7d");

  sendResponse(200, user, res, token);
});

exports.signup = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, passwordConfirm, birthDate } = req.body;
  const fields = {
    firstName,
    lastName,
    email,
    password,
    passwordConfirm,
    birthDate,
  };

  for (const [key, value] of Object.entries(fields)) {
    if (!value) return next(new AppError(400, `${key} is required.`));
  }

  let user = await User.findOne({ email }).select("+birthDate");
  if (user && !user.password) {
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();
  } else {
    user = await User.create(fields);
  }
  const token = await createToken(user, "7d");
  sendResponse(201, user, res, token);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError(400, "Please Provide both Email and Password"));

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new AppError(401, process.env.NODE_ENV === "development" ? "no user with this email" : "Email or Password is incorrect"));

  if (!user.password) return next(new AppError(400, "This email is registered with Google/Facebook. Please log in using that method or set a password first."));

  const isCorrectPassword = await user.isCorrectPassword(password);
  if (!isCorrectPassword) return next(new AppError(401, process.env.NODE_ENV === "development" ? "password is incorrect" : "Email or Password is incorrect"));

  const token = await createToken(user, "7d");

  sendResponse(200, user, res, token);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError(400, "This Email is not Belonging to any User."));

  const token = user.createResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/resetPassword/${token}`;
  const message = `forgot your password? submit a POST request to this url: \n ${resetURL}\nif you didn't forget your password please ignore this email`;

  try {
    await sendEmail({
      email,
      message,
      subject: "resetting password",
    });
  } catch (error) {
    console.log(error);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(500, "something went wrong, please try again later"));
  }

  sendResponse(200, null, res, null, "reset token send to your email");
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (!password || !passwordConfirm) return next(new AppError(400, "please provide both password and confirm"));

  const hashedToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  });
  if (!user) return next(new AppError(400, "invalid token or expired one."));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresIn = undefined;
  await user.save();

  const token = await createToken(user, "7d");

  user.password = undefined;

  sendResponse(200, user, res, token, "Password Updated Successfully!");
});

exports.protect = catchAsync(async (req, res, next) => {
  const tokenHeader = req.headers.authorization?.startsWith("Bearer") ? req.headers.authorization.split(" ")[1] : null;
  if (!tokenHeader) return next(new AppError(401, "please log in to perform this action."));

  const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload: decoded } = await jwtVerify(tokenHeader, jwtSecret); // to not block the code with jwt.verify (no async version availble)

  const user = await User.findById(decoded.id).select("+password");
  if (!user) return next(new AppError(401, "User belonging to this token no longer exists."));

  if (decoded.iat * 1000 < user.lastLogin) return next(new AppError("This Token is expired, please re-login"));

  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new AppError(403, `You do not have permission to perform this action`));

    next();
  };
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;
  if (!currentPassword || !password || !passwordConfirm) return next(new AppError(400, "please Provide your Current and new Password and its Confirm"));

  const user = req.user;
  const isCorrect = await user.isCorrectPassword(currentPassword);

  if (!isCorrect) return next(new AppError(401, "wrong password"));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  const token = await createToken(user, "7d");

  user.password = undefined;

  sendResponse(200, user, res, token, "Password Updated Successfully!");
});

exports.checkOwnership = (Model) =>
  catchAsync(async (req, res, next) => {
    const docToUpdate = await Model.findById(req.params.id);

    if (!docToUpdate) return next(new AppError(404, `no ${Model.modelName} found with this ID: ${req.params.id}`));

    if (docToUpdate.user.toString() !== req.user.id) return next(new AppError(403, "You do not have permission to modify this"));
    next();
  });

exports.softJWTCheck = catchAsync(async (req, res, next) => {
  const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null;

  if (!token) return next();

  const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload: decoded } = await jwtVerify(token, jwtSecret);

  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError(401, "User belonging to this token no longer exists."));
  req.user = user;
  next();
});
