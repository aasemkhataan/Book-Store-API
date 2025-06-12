const catchAsync = require("../utils/catchAsync");
const User = require("./../models/userModel");
const { sendResponse } = require("./handlerFactory");
const factory = require("./handlerFactory");
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

exports.updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterBody(req.body, ["firstName", "lastName", "email", "birthDate", "gender", "photo"]);

  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  sendResponse(200, user, res);
});
