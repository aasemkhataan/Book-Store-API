const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
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
    if (req.params?.bookId) filter = { book: req.params.bookId };

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
    if (options.cartLogic) return createNewCartItem(req, res, next);

    const doc = await Model.create(req.body);

    sendResponse(201, doc, res, null, `${Model.modelName} created successfully!`);
  });

exports.updateOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    //
    if (options?.cartLogic) return handleUpdateCart(req, res, next);
    if (options?.orderLogic) return handleUpdateOrder(req, res, next);
    if (req.file) req.body.coverImage = req.file.filename;

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });
    if (!doc) return next(new AppError(404, `No ${Model.modelName} found with this ID.`));

    sendResponse(200, doc, res, null, `${Model.modelName} updated successfully!`);
  });

exports.deleteOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    if (options?.cartLogic) return handleDeleteCartItem(req, res, next);

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
      return sendResponse(204, null, res, null, "Cart deleted successfully");
    }

    if (req.params.bookId) {
      await mongoose.model("Review").deleteMany({ book: req.params.bookId });
      return sendResponse(204, null, res, null, "All reviews for this book deleted");
    }

    await Model.deleteMany();
    sendResponse(204, null, res, null, `${Model.modelName}s deleted successfully`);
  });

// handlers

const createNewCartItem = catchAsync(async (req, res, next) => {
  const { book, quantity = 1 } = req.body;

  await ensureEnoughStock(book, quantity);
  let cart;
  let message;
  let statusCode = 200;
  cart = await mongoose.model("Cart").findOne({ user: req.user._id });

  if (!cart) {
    // no cart yet

    cart = await mongoose.model("Cart").create({ user: req.user._id, items: [{ book, quantity }] });
    message = "Cart created and item added!";
    statusCode = 201;
  } else {
    const item = cart.items.find((i) => i.book.equals(book));

    if (item) {
      item.quantity += quantity;
      message = "Quantity updated in cart!";
    } else {
      cart.items.push({ book, quantity });
      message = "Item added to cart!";
    }
  }
  await cart.save();

  sendResponse(statusCode, cart, res, null, message);
});

const handleUpdateCart = catchAsync(async (req, res, next) => {
  const cart = await mongoose.model("Cart").findOne({ user: req.user.id });

  if (!cart) return next(new AppError(404, "Cart not found"));

  const item = cart.items.id(req.params.id);
  if (!item) return next(new AppError(404, "Item not found"));

  if (!req.body.quantity) return next(new AppError(400, "Please provide a quantity"));

  const book = await mongoose.model("Book").findById(item.book).select("stock");
  if (!book) return next(new AppError(404, "Book not found"));

  const hasEnoughStock = await ensureEnoughStock(book._id, req.body.quantity);
  if (!hasEnoughStock) return next(new AppError(400, "No enough stock"));

  item.quantity = req.body.quantity;
  await cart.save();
  return sendResponse(200, cart, res, null, `Cart item updated successfully`);
});

const handleUpdateOrder = catchAsync(async (req, res, next) => {
  const order = await mongoose.model("Order").findOne({ user: req.user.id, _id: req.params.id });
  if (!order) return next(new AppError(404, "order not found"));

  if (order.status !== "pending") return next(new AppError(400, "Can't update order after it is processed"));

  if (!req.body.shippingAddress && !req.body.paymentMethod) return next(new AppError(400, "Nothing to update"));

  const allowedUpdates = ["shippingAddress", "paymentMethod"];

  allowedUpdates.forEach((field) => {
    if (req.body[field]) order[field] = req.body[field];
  });

  await order.save();
  return sendResponse(200, order, res, null, `Order updated successfully!`);
});

const handleDeleteCartItem = catchAsync(async (req, res, next) => {
  const cart = await mongoose.model("Cart").findOne({ user: req.user.id });
  if (!cart) return next(new AppError(404, "Cart not found"));

  const item = cart.items.id(req.params.id);
  if (!item) return next(new AppError(404, "Item not found"));

  cart.items.pull(item.id);
  await cart.save();

  return sendResponse(200, cart, res, null, `Cart item deleted successfully`);
});
