// routes/orderRoutes.js
const router = require("express").Router();
const orderController = require("../controllers/orderController");
const { protect, restrictTo } = require("../controllers/authController");

router.use(protect); // لازم المستخدم يكون مسجّل دخول

router.route("/").get(restrictTo("admin"), orderController.getAllOrders).post(orderController.createOrder);

router.route("/my-orders").get(orderController.getMyOrders); // كل مستخدم يشوف طلباته فقط

router
  .route("/:id")
  .get(orderController.getOrder)
  .patch(restrictTo("admin"), orderController.updateOrderStatus) // تغيير الحالة (شحن، تم التسليم)
  .delete(restrictTo("admin"), orderController.deleteOrder);

module.exports = router;
