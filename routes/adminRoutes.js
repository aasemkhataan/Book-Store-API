// routes/adminRoutes.js

const router = require("express").Router();
const { protect, restrictTo } = require("./../controllers/authController");
const bookController = require("./../controllers/bookController");
const userController = require("./../controllers/userController");
const cartController = require("./../controllers/cartController");
const reviewController = require("./../controllers/reviewController");
const orderController = require("./../controllers/orderController");
const upload = require("./../utils/upload-photos")("book");

router.use(protect, restrictTo("admin"));

// ===== Books =====
router.route("/books").get(bookController.getAllBooks).post(bookController.createBook).delete(bookController.deleteAllBooks);

router.route("/books/:id").get(bookController.getBook).patch(upload.single("coverImage"), bookController.updateBook).delete(bookController.deleteBook);

router.post("/fetchBookData", bookController.fetchBookData);

// ===== Users =====
router.route("/users").get(userController.getAllUsers).delete(userController.deleteAllUsers);

router.route("/users/:id").get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

// ===== Carts =====
router.route("/cart").get(cartController.adminGetAllCarts).delete(cartController.adminDeleteAllCarts);

router.route("/cart/:id").get(cartController.adminGetUserCart).delete(cartController.adminDeleteCart);

// ===== Reviews =====
router.route("/reviews").get(reviewController.getAllReviews).delete(reviewController.deleteAllReviews);
router.route("/books/:bookId/reviews").get(reviewController.getAllReviews).delete(reviewController.deleteAllReviews);

router.route("/reviews/:id").get(reviewController.getReview).patch(reviewController.updateReview).delete(reviewController.deleteReview);

// ===== Orders =====

router.route("/orders").get(orderController.getAllOrders).delete(orderController.deleteAllOrders);
router.route("/orders/:id").get(orderController.getOrder).patch(orderController.updateOrderStatus).delete(orderController.deleteOrder);
router.patch("/orders/:id/mark-delivered", orderController.markAsDelivered);
router.patch("/orders/:id/mark-paid", orderController.markAsPaid);

module.exports = router;
