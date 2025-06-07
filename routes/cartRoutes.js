const express = require("express");
const router = express.Router();

const controllers = require("../controllers/cartController");
const { protect } = require("../controllers/authController");

router.use(protect);

router.route("/").get(controllers.getAllItems).post(controllers.insertBodyUserId, controllers.createItem).delete(controllers.deleteAllItems);
router.route("/:id").get(controllers.getItem).patch(controllers.updateItem).delete(controllers.deleteItem);

module.exports = router;
