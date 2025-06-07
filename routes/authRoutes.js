const controllers = require("./../controllers/authController");
const express = require("express");
const router = express.Router();
const passport = require("passport");

router.post("/signup", controllers.signup);
router.post("/login", controllers.login);
router.post("/forgotPassword", controllers.forgotPassword);
router.patch("/resetPassword/:resetToken", controllers.resetPassword);
router.patch("/updatePassword", controllers.protect, controllers.updatePassword);
//
// google Oauth

router.get("/google", passport.authenticate("google"));

//

router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }), controllers.googleAuth);

//

router.get("/facebook", passport.authenticate("facebook"));

router.get("/facebook/callback", passport.authenticate("facebook", { session: false }), controllers.facebookAuth);

module.exports = router;
