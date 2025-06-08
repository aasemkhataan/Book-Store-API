const router = require("express").Router();
const controllers = require("../controllers/bookController");
const reviewRouter = require("./reviewRoutes");

const cartRouter = require("./userCartRoutes");

router.use("/:bookId/addToCart", cartRouter);
router.use("/:bookId/reviews/", reviewRouter);

router.post("/fetchBookData", controllers.fetchBookData);
router.route("/").get(controllers.getAllBooks).post(controllers.createBook).delete(controllers.deleteAllBooks);
router.route("/:id").get(controllers.getBook).patch(controllers.updateBook).delete(controllers.deleteBook);
module.exports = router;
