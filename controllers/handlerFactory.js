const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const CartItem = require("../models/cartModel");
const ensureEnoughStock = require("./../utils/ensureEnoughStock");
const mongoose = require("mongoose");

const sendResponse = function (statusCode, data, res, token, message) {
  const response = {
    status: "success",
  };

  if (message) response.message = message;
  if (Array.isArray(data)) response.results = data.length;
  if (token) response.token = token;
  if (data) response.data = data;
  res.status(statusCode).json(response);
};

exports.sendResponse = sendResponse;

exports.getAll = (Model, options) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (options?.filerByUser) filter = { user: req.user.id };
    if (req?.params?.bookId) filter = { book: req.params.bookId };

    let features = new APIFeatures(Model.find(filter), req.query).filter().sort().paginate().limitFields();
    const docs = await features.query;

    sendResponse(200, docs, res);
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id).populate(populateOptions);

    if (!doc) return next(new AppError(404, `no ${Model.modelName} found with this ID.`));

    sendResponse(200, doc, res);
  });

exports.createOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    let doc, message;
    let statusCode = 201;

    if (options?.cartLogic) {
      const { user, book, quantity = 1 } = req.body;

      doc = await Model.findOne({ user }); // cart

      if (!doc) {
        // no cart yet
        await ensureEnoughStock(book, quantity);
        doc = await Model.create({ user, items: [{ book, quantity }] });
        message = "Cart created and item added!";
      } else {
        const item = doc.items.find((i) => i.book.toString() === book);

        if (item) {
          const newQuantity = item.quantity + quantity;
          await ensureEnoughStock(book, newQuantity);
          item.quantity = newQuantity;
          message = "Quantity updated in cart!";
        } else {
          await ensureEnoughStock(book, quantity);
          doc.items.push({ book, quantity });
          message = "Item added to cart!";
        }
      }

      await doc.save();
      statusCode = 200;
    } else {
      doc = await Model.create(req.body);
      message = "created successfully!";
    }

    sendResponse(statusCode, doc, res, `${Model.modelName} ${message}`);
  });

exports.updateOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    //
    if (options?.cartLogic) {
      const cart = await Model.findOne({ user: req.user.id });
      if (!cart) return next(new AppError(404, "Cart not found"));

      const item = cart.items.id(req.params.id);
      if (!item) return next(new AppError(404, "Item not found"));

      if (!req.body.quantity) return next(new AppError(400, "Please provide a quantity"));

      const book = await mongoose.model("Book").findById(item.book).select("stock");
      if (!book) return next(new AppError(404, "Book not found"));

      if (book.stock < req.body.quantity) return next(new AppError(400, "Not enough stock"));

      item.quantity = req.body.quantity;
      await cart.save();
      return sendResponse(200, cart, res, `Cart item updated successfully`);
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    if (!doc) return next(new AppError(404, `No ${Model.modelName} found with this ID.`));

    sendResponse(200, doc, res, `${Model.modelName} updated successfully!`);
  });

exports.deleteOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    if (options?.cartLogic) {
      const cart = await Model.findOne({ user: req.user.id });
      if (!cart) return next(new AppError(404, "Cart not found"));

      const item = cart.items.id(req.params.id);
      if (!item) return next(new AppError(404, "Item not found"));

      cart.items.pull(item.id);
      await cart.save();

      return sendResponse(200, cart, res, `Cart item deleted successfully`);
    }

    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError(404, `no ${Model.modelName} found with this ID.`));

    sendResponse(204, null, res);
  });

exports.deleteAll = (Model, options) =>
  catchAsync(async (req, res, next) => {
    if (options?.cartLogic) {
      const cart = await Model.findOne({ user: req.user.id });
      if (!cart) return next(new AppError(404, "Cart not found"));

      await Model.findByIdAndDelete(cart._id);
      return sendResponse(204, null, res, "Cart deleted successfully");
    }

    if (req.params.bookId) {
      await mongoose.model("Review").deleteMany({ book: req.params.bookId });
      return sendResponse(204, null, res, "All reviews for this book deleted");
    }

    await Model.deleteMany();
    sendResponse(204, null, res, `${Model.modelName}s deleted successfully`);
  });
