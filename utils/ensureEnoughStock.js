const mongoose = require("mongoose");
const AppError = require("./appError");

const ensureEnoughStock = async (bookId, desiredQuantity) => {
  const book = await mongoose.model("Book").findById(bookId).select("stock");
  if (!book) throw new AppError(404, "Book not found");

  if (book.stock < desiredQuantity) throw new AppError(400, `Only ${book.stock} copies available`);

  return book;
};

module.exports = ensureEnoughStock;
