const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { sendResponse } = require("./handlerFactory");
const factory = require("./handlerFactory");
const CartItem = require("./../models/cartItemModel");

exports.insertBodyUserId = (req, res, next) => {
  req.body.user = req.user.id;
  next();
};

exports.getAllItems = factory.getAll(CartItem);
exports.getItem = factory.getOne(CartItem);
exports.deleteItem = factory.deleteOne(CartItem);
exports.deleteAllItems = factory.deleteAll(CartItem);
exports.createItem = factory.createOne(CartItem, { cartItemLogic: true });
exports.updateItem = factory.updateOne(CartItem);
