const mongoose = require('mongoose');
const validator = require('validator');
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'a book must have a title']
    },
    author: {
      type: Array,
      required: [true, 'a book must have an author']
    },
    pageCount: {
      type: Number,
      required: [true, 'a book must have pages count']
    },
    publisher: {
      type: String,
      required: [true, 'a book must have a publisher']
    },
    publishedDate: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: [true, 'a book must have a description']
    },
    imageLinks: {
      type: String,
      required: true
    },
    language: { type: String, default: 'ar' },
    stock: {
      type: Number,
      default: 0
    },
    categories: {
      type: String,
      enum: ['fiction', 'non-fiction', 'science', 'history', 'biography']
    },
    price: {
      type: Number,
      required: [true, 'a book must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'discount must be less than the orignal price'
      }
    },
    ISBN_10: String,
    ISBN_13: String,
    ratingsAverage: {
      type: Number,
      min: 1,
      max: 5
    },
    ratingQuantity: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

bookSchema.pre('save', function (next) {
  if (this.ratingQuantity === 0) this.ratingsAverage = undefined;
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
