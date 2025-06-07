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
// exports.addItem = catchAsync(async (req, res, next) => {
//   const { book: bookId } = req.body;

//   if (!bookId) return next(new AppError(400, "please provide book id"));
//   const user = await User.findById(req.user._id);

//   let found = false;

//   for (let item of user.cart) {
//     if (item.book && item.book.equals(bookId)) {
//       item.quantity++;
//       found = true;
//       break;
//     }
//   }

//   if (!found) user.cart.push({ book: bookId });

//   await user.save({ validateBeforeSave: false });

//   sendResponse(200, { cart: user.cart }, res);
// });
