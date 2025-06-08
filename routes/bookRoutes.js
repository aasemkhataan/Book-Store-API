const express = require("express");
const controllers = require("../controllers/bookController");
const reviewRouter = require("./reviewRoutes");
const router = express.Router();

router.use("/:bookId/reviews/", reviewRouter);

router.post("/fetchBookData", controllers.fetchBookData);
router.route("/").get(controllers.getAllBooks).post(controllers.createBook).delete(controllers.deleteAllBooks);
router.route("/:id").get(controllers.getBook).patch(controllers.updateBook).delete(controllers.deleteBook);
module.exports = router;
