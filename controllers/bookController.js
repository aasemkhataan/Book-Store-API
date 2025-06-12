const catchAsync = require("../utils/catchAsync");
const Book = require("./../models/bookModel");
const factory = require("./handlerFactory");
const getBook = require("./../utils/importBookByName");
const AppError = require("./../utils/appError");
const { sendResponse } = require("./handlerFactory");

exports.fetchBookData = catchAsync(async (req, res, next) => {
  const { title, author } = req.body;

  if (!title) {
    return next(new AppError(400, "Please provide at least book title"));
  }

  const book = await getBook(title, author);

  if (!book) {
    return next(new AppError(404, "Book not found from external API"));
  }
  sendResponse(200, book, res);
});

exports.getAllBooks = factory.getAll(Book);
exports.getBook = factory.getOne(Book, { path: "reviews" });
exports.createBook = factory.createOne(Book);
exports.updateBook = factory.updateOne(Book);
exports.deleteBook = factory.deleteOne(Book);
exports.deleteAllBooks = factory.deleteAll(Book);
