const { protect, restrictTo } = require("../controllers/authController");
const controllers = require("./../controllers/userController");
const router = require("express").Router();
const cartRouter = require("./cartRoutes");

router.use("/:userId/cart", cartRouter);
router.use(protect);

router.route("/me").get(controllers.getMe, controllers.getUser).patch(controllers.updateMe).delete(controllers.deleteMe);

module.exports = router;
