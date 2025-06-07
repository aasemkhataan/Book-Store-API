const express = require("express");
const controllers = require("../controllers/bookController");
const router = express.Router();

router.post("/fetchBookData", controllers.fetchBookData);
router.route("/").get(controllers.getAllBooks).post(controllers.createBook).delete(controllers.deleteAllBooks);
router.route("/:id").get(controllers.getBook).patch(controllers.updateBook).delete(controllers.deleteBook);
module.exports = router;
