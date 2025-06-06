const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
require("dotenv").config({ path: "./config.env" });

console.log(process.env.FACEBOOK_CLIENT_ID);
const facebookOptions = {
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/api/v1/auth/facebook/callback",
  profileFields: ["id", "emails", "name", "displayName", "gender", "birthday", "location", "hometown", "age_range", "link", "picture.type(large)"],
  scope: ["email", "user_birthday", "user_location", "user_gender", "user_hometown", "public_profile", "user_age_range"],
};

const verifyCallback = async function (accessToken, refreshToken, profile, done) {
  console.log(profile);
  const { id, email, first_name, last_name, birthday, gender, location, picture } = profile._json;

  const user = {
    facebookId: id,
    email,
    firstName: first_name,
    lastName: last_name,
    gender,
    birthDate: new Date(birthday),
    location: location?.name,
    photo: picture?.data?.url,
  };
  done(null, user);
};

passport.use(new FacebookStrategy(facebookOptions, verifyCallback));
