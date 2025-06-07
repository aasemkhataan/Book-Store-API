const { protect, restrictTo } = require("../controllers/authController");
const controllers = require("./../controllers/userController");
const router = require("express").Router();

router.use(protect);

router.route("/me").get(controllers.getMe, controllers.getUser).delete(controllers.deleteMe);
router.route("/").get(controllers.getAllUsers).delete(controllers.deleteAllUsers);
router.route("/:id").get(controllers.getUser).patch(controllers.updateUser).delete(controllers.deleteUser);

module.exports = router;
