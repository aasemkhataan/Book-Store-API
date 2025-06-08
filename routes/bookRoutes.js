const router = require("express").Router();
const controllers = require("../controllers/bookController");
const reviewRouter = require("./reviewRoutes");

const cartRouter = require("./cartRoutes");

router.use("/:bookId/addToCart", cartRouter);
router.use("/:bookId/reviews/", reviewRouter);

router.route("/").get(controllers.getAllBooks);
router.route("/:id").get(controllers.getBook);
module.exports = router;
