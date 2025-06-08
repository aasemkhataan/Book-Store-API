const Review = require("./../models/reviewModel");
const factory = require("./handlerFactory");

exports.insertBodyBookUserId = (req, res, next) => {
  req.body.user = req.user.id;
  req.body.book = req.params.bookId;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);

exports.adminGetAllReviews = factory.getAll(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.deleteAllReviews = factory.deleteAll(Review);
