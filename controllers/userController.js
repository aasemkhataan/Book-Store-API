const catchAsync = require("../utils/catchAsync");
const User = require("./../models/userModel");
const { sendResponse } = require("./handlerFactory");
const factory = require("./handlerFactory");
const sharp = require("sharp");

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User, "cart");
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.deleteAllUsers = factory.deleteAll(User);

// => /me End Point

const filterBody = function (body, allowedFields) {
  const filteredObj = {};
  Object.keys(body).forEach((key) => {
    if (allowedFields.includes(key)) filteredObj[key] = body[key];
  });

  return filteredObj;
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = req.user;

  user.active = false;
  await user.save({ validateBeforeSave: false });

  sendResponse(204, null, res);
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.resizeImage = async (req, res, next) => {
  if (!req.file) return next();

  console.log(req.file);

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer).rotate().resize(500, 500).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);

  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterBody(req.body, ["firstName", "lastName", "email", "birthDate", "gender"]);
  if (req.file) filteredBody.photo = req.file.filename;
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  sendResponse(200, user, res);
});
