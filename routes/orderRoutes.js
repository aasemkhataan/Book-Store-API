// routes/orderRoutes.js
const router = require("express").Router();
const controllers = require("../controllers/orderController");
const { protect, restrictTo } = require("../controllers/authController");

router.get("/success", controllers.confirmPayment);
router.use(protect);
router.get("/checkout-session/:orderId", controllers.getCheckoutSession);

router.post("/checkout", controllers.createOrder);
router.get("/my-orders", controllers.getMyOrders);

router.patch("/:id/cancel", controllers.cancelMyOrder);

router.route("/:id").get(controllers.getOrder).patch(controllers.updateMyOrder);

module.exports = router;
