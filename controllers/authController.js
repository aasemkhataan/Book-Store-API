const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("./handlerFactory");
const sendEmail = require("./../utils/sendEmail");
const crypto = require("crypto");

const createToken = async (user, expiresIn) => {
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
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

  const token = createToken(user, "7d");

  await user.save({ validateBeforeSave: false });

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
