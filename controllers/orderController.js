const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Cart = require("./../models/cartModel");
const Order = require("./../models/orderModel");
const { sendResponse } = require("./handlerFactory");
const factory = require("./handlerFactory");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.getMyOrders = factory.getAll(Order, { filterByUser: true });
exports.getOrder = factory.getOne(Order, { path: "items.book", select: "title priceAtPurchase quantity" });
exports.updateMyOrder = factory.updateOne(Order, { orderLogic: true });

exports.createOrder = catchAsync(async (req, res, next) => {
  if (!req.body.shippingAddress) return next(new AppError(400, "please provide your shipping address"));

  const cart = await Cart.findOne({ user: req.user.id }).populate("items.book");
  if (!cart || !cart.items.length) return next(new AppError(404, "Cart is Empty"));

  const orderItems = cart.items.map((item) => {
    return { book: item.book.id, quantity: item.quantity, priceAtPurchase: item.book.price };
  });
  const totalPrice = cart.subtotal - cart.discount;

  const order = await Order.create({
    items: orderItems,
    paymentMethod: req.body.paymentMethod || "cash",
    shippingAddress: req.body.shippingAddress,
    totalPrice,
    user: req.user.id,
  });

  await Cart.findOneAndDelete({ user: req.user.id });
  sendResponse(201, order, res, {}, "Order created successfully!");
});

exports.cancelMyOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ user: req.user.id, _id: req.params.id });

  if (!order) return next(new AppError(404, "Order Not Found!"));
  order.status = "cancelled";
  await order.save();

  sendResponse(200, order, res, {}, "Your Order has been Cancelled Successfully.");
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId).populate("items.book");

  if (order.paidAt) return next(new AppError(400, "This Order is Paid Already!"));
  if (order.status === "cancelled") return next(new AppError(400, "This order has been cancelled and cannot be paid"));

  const line_items = order.items.map((item) => ({
    price_data: {
      currency: "egp",
      unit_amount: Math.round(item.priceAtPurchase * 100),
      product_data: {
        name: item.book.title,
        description: item.book.author.join(", "),
      },
      quantity: item.quantity,
    },
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: req.user.email,
    client_reference_id: order._id.toString(),
    success_url: `${req.protocol}://${req.get("host")}/api/v1/success?orderId=${order._id}`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/cancel`,
    line_items,
  });

  sendResponse(201, session, res);
});

exports.confirmPayment = catchAsync(async (req, res, next) => {
  const { orderId } = req.query;
  if (!orderId) return next(new AppError(400, "Missing orderId"));

  const order = await Order.findById(orderId);
  if (!order) return next(new AppError(404, "Order not found"));

  if (order.paidAt) return next(new AppError(400, "This Order is Already Paid!!"));
  if (order.status === "cancelled") return next(new AppError(400, "This order has been cancelled"));

  order.paidAt = Date.now();
  order.paymentMethod = "card";
  order.status = "processing";
  await order.save({ validateBeforeSave: false });

  sendResponse(200, order, res, null, "Your Order has Paid Successfully");
});

// admin routes

exports.getAllOrders = factory.getAll(Order);
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  if (!status) return next(new AppError(400, "please Provide the current Status"));

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

  if (!order) return next(new AppError(404, "Order not found"));

  sendResponse(200, order, res, {}, "Order Updated Successfully!");
});

exports.deleteOrder = factory.deleteOne(Order);
exports.deleteAllOrders = factory.deleteAll(Order);

exports.markAsPaid = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError(404, "Order Not Found!"));

  if (order.paidAt) return next(new AppError(400, "This Order is Paid Already!"));

  order.status = "processing";
  order.paidAt = Date.now();
  await order.save({ validateBeforeSave: false });

  sendResponse(200, order, res);
});

exports.markAsDelivered = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError(404, "Order Not Found!"));

  if (order.deliveredAt) return next(new AppError(400, "This Order is Delivered Already!"));

  order.status = "delivered";
  order.deliveredAt = Date.now();
  await order.save({ validateBeforeSave: false });

  sendResponse(200, order, res);
});
