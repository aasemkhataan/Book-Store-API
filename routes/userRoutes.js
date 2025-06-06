const controllers = require("./../controllers/userController");
const router = require("express").Router();

router.route("/").get(controllers.getAllUsers).delete(controllers.deleteAllUsers);
router.route("/:id").get(controllers.getUser).patch(controllers.updateUser).delete(controllers.deleteUser);
module.exports = router;
