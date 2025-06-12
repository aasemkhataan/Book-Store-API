const router = require("express").Router({ mergeParams: true });
const controllers = require("../controllers/cartController");
const { protect, restrictTo } = require("../controllers/authController");

router.use(protect);

router.route("/").get(controllers.getMyCart).post(controllers.insertUserId, controllers.insertBookId, controllers.addToCart).delete(controllers.emptyCart);
router.route("/:id").patch(controllers.updateCartItem).delete(controllers.deleteCartItem);

module.exports = router;
