// const passport = require("passport");
// const AppError = require("../utils/appError");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const axios = require("axios");
// require("dotenv").config({ path: `${__dirname}/../config.env` });

// const googleOptions = {
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: "http://127.0.0.1:3000/api/v1/auth/google/callback",
//   scope: [
//     "profile",
//     "email",
//     "https://www.googleapis.com/auth/user.phonenumbers.read",
//     "https://www.googleapis.com/auth/user.birthday.read",
//     "https://www.googleapis.com/auth/user.gender.read",
//     "https://www.googleapis.com/auth/user.addresses.read",
//   ],
//   prompt: "consent",
//   accessType: "offline",
// };

// const verfiyCallBack = async function (
//   accessToken,
//   refreshToken,
//   profile,
//   done
// ) {
//   if (!profile)
//     return done(new AppError(401, "No Profile returned from Google."), null);

//   const response = await axios.get(
//     "https://people.googleapis.com/v1/people/me?personFields=birthdays,genders,phoneNumbers,addresses",
//     {
//       headers: { Authorization: `Bearer ${accessToken}` },
//     }
//   );
//   const extraData = response.data;

//   console.log("birth", extraData.birthdays);
//   const fullProfile = {
//     firstName: profile.displayName?.split(" ")[0],
//     lastName: profile.displayName?.split(" ")[1],
//     googleId: profile.id,
//     phone: 0,
//     birthDate: {
//       year: extraData.birthdays?.[1]?.date?.year,
//       month: extraData.birthdays?.[1]?.date?.month,
//       day: extraData.birthdays?.[1]?.date?.day,
//     },
//     email: profile.emails?.[0]?.value,
//     photo: profile.photos?.[0]?.value,
//     gender: extraData.genders?.[0]?.value,
//   };

//   return done(null, fullProfile);
// };

// passport.use(new GoogleStrategy(googleOptions, verfiyCallBack));

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
    console.log(profile);
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
