const router = require("express").Router({ mergeParams: true });

const controllers = require("../controllers/reviewController");
const { protect, restrictTo, checkOwnership } = require("../controllers/authController");
const Review = require("../models/reviewModel");

router
  .route("/")
  .get(controllers.getAllReviews)
  .post(protect, controllers.insertBodyBookUserId, controllers.createReview)
  .delete(protect, restrictTo("admin"), controllers.deleteAllReviews);
router
  .route("/:id")
  .get(controllers.getReview)
  .patch(protect, controllers.insertBodyBookUserId, checkOwnership(Review), controllers.updateReview)
  .delete(protect, controllers.insertBodyBookUserId, checkOwnership(Review), controllers.deleteReview);

module.exports = router;
