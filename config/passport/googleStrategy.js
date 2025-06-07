const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const axios = require("axios");
const AppError = require("../../utils/appError");
require("dotenv").config({ path: `./config.env` });

const googleOptions = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://127.0.0.1:3000/api/v1/auth/google/callback",
  scope: ["profile", "email", "https://www.googleapis.com/auth/user.birthday.read", "https://www.googleapis.com/auth/user.gender.read"],
  prompt: "consent",
  accessType: "offline",
};

const verifyCallback = async function (accessToken, refreshToken, profile, done) {
  try {
    const response = await axios.get("https://people.googleapis.com/v1/people/me?personFields=birthdays,genders,phoneNumbers,addresses", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const rawBirthday = response.data.birthdays?.find((el) => el.date?.year && el.date?.month && el.date?.day)?.date;

    const birthDate = rawBirthday ? new Date(Date.UTC(rawBirthday.year, rawBirthday.month - 1, rawBirthday.day)) : null;

    const fullProfile = {
      googleId: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails?.[0]?.value,
      photo: profile.photos?.[0]?.value,
      gender: response.data.genders?.[0]?.value,
      birthDate,
    };

    done(null, fullProfile);
  } catch (error) {
    console.error("error: 🤬", error);
    done(error, null);
  }
};

passport.use(new GoogleStrategy(googleOptions, verifyCallback));
