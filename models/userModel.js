const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { promisify } = require("util");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 2,
      maxlength: 15,
      validate: {
        validator: function (value) {
          return validator.isAlpha(value, "ar", { ignore: " " }) || validator.isAlpha(value, "en-US", { ignore: " " });
        },
        message: "First Name must contain only Arabic or English letters",
      },
    },
    firstName: {
      type: String,
      minlength: 2,
      maxlength: 15,
      validate: {
        validator: function (value) {
          return validator.isAlpha(value, "ar", { ignore: " " }) || validator.isAlpha(value, "en-US", { ignore: " " });
        },
        message: "first Name must contain only Arabic or English letters",
      },
    },
    lastName: {
      type: String,
      minlength: 2,
      maxlength: 15,
      validate: {
        validator: function (value) {
          return validator.isAlpha(value, "ar", { ignore: " " }) || validator.isAlpha(value, "en-US", { ignore: " " });
        },
        message: "Last Name must contain only Arabic or English letters",
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    birthDate: {
      type: Date,
      required: [true, "please enter your birthday"],
    },
    email: {
      type: String,
      unique: [true, "this email is taken already."],
      required: [true, "please provide your email"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.facebookId;
      },

      select: false,
      validate: {
        validator: function (value) {
          return (
            validator.isStrongPassword(value, {
              minLength: 12,
              minUppercase: 1,
              minNumbers: 1,
              minSymbols: 1,
            }) && validator.isAscii(value)
          );
        },
        message: "Password must be at least 12 characters long, contain lowercase and uppercase letters, at least 1 number, 1 special character, and only use English characters.",
      },
    },
    passwordConfirm: {
      type: String,
      required: function () {
        return !this.googleId && !this.facebookId;
      },

      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Passwords do not match",
      },
    },
    photo: {
      type: String,
    },
    passwordChangedAt: {
      type: Date,
    },
    lastLogin: {
      type: Date,
      default: null,
      select: false,
    },
    passwordResetToken: String,
    passwordResetTokenExpiresIn: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("fullName").get(function () {
  const fullName = this.firstName + " " + this.lastName;
  return fullName;
});

userSchema.methods.createResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;

  return token;
};

userSchema.methods.isCorrectPassword = async function (inputedPass) {
  if (!this.password) {
    throw new Error("Password field not selected from database");
  }
  return bcrypt.compare(inputedPass, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const hashedPass = await bcrypt.hash(this.password, 12);

  console.log("hashedPass", hashedPass);

  this.password = hashedPass;
  this.passwordConfirm = undefined;
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
