const mongoose = require("mongoose");
const Book = require("./bookModel");

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, `a review can't be empty.`],
    minlength: 10,
    maxlength: 150,
  },
  rating: {
    type: Number,
    required: [true, `a review must have a rating from 1 to 5`],
    min: 1,
    max: 5,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "a review must belong to a user"],
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: [true, "a review must belong to a book"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

reviewSchema.index({ user: 1, book: 1 }, { unique: true });

reviewSchema.statics.updateRatingsAverageAndQuantity = async function (bookID) {
  const stats = await this.aggregate([
    { $match: { book: bookID } },
    {
      $group: {
        _id: "$book",
        ratings: { $avg: "$rating" },
        quantity: { $sum: 1 },
      },
    },
  ]);

  if (stats.length) {
    await Book.findByIdAndUpdate(bookID, {
      ratingsAverage: parseFloat(stats[0].ratings.toFixed(1)),
      ratingQuantity: stats[0].quantity,
    });
  } else {
    await Book.findByIdAndUpdate(bookID, {
      ratingsAverage: 0,
      ratingQuantity: 0,
    });
  }
};

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName photo",
  });
  next();
});
reviewSchema.post("save", async function (doc) {
  await doc.constructor.updateRatingsAverageAndQuantity(doc.book);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.updateRatingsAverageAndQuantity(doc.book);
});
const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
