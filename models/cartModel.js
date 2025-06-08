const mongoose = require("mongoose");
const Book = require("./bookModel");

const ItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },

  quantity: {
    type: Number,
    min: 1,
    default: 1,
  },

  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema({
  items: [ItemSchema],

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true,
  },
  // promoCode: {  ====> needs a promoCode collection
  //   type: String,
  //   trim: true,
  // },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 1,
  },
  subtotal: {
    type: Number,
  },
});

cartSchema.pre("save", async function (next) {
  let total = 0;
  for (let item of this.items) {
    const book = await Book.findById(item.book).select("price");
    if (!book) continue;

    if (book.stock < item.quantity) {
      return next(new AppError("Not enough stock"));
    }

    total += book.price * item.quantity;
  }
  this.subtotal = total;
  next();
});

cartSchema.post(/^findOneAnd/, async function (doc) {
  if (!doc) return;
  let total = 0;
  for (let item of doc.items) {
    const book = await Book.findById(item.book).select("price");
    if (!book) continue;

    total += book.price * item.quantity;
  }
  doc.subtotal = total;
  await doc.save();
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
