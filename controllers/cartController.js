const factory = require("./handlerFactory");
const Cart = require("./../models/cartModel");

exports.insertUserId = (req, res, next) => {
  req.body.user = req.params.userId || req.user.id;
  next();
};

exports.insertBookId = (req, res, next) => {
  req.body.book = req.params.bookId || req.body.book;
  next();
};

exports.adminGetAllCarts = factory.getAll(Cart);
exports.adminGetUserCart = factory.getOne(Cart);
exports.adminDeleteAllCarts = factory.deleteAll(Cart);
exports.adminDeleteCart = factory.deleteOne(Cart);
//

exports.getMyCart = factory.getAll(Cart, { filterByUser: true });
exports.addToCart = factory.createOne(Cart, { cartLogic: true });
exports.updateCartItem = factory.updateOne(Cart, { cartLogic: true });
exports.deleteCartItem = factory.deleteOne(Cart, { cartLogic: true });
exports.emptyCart = factory.deleteAll(Cart, { cartLogic: true });
