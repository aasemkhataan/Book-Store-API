const helmet = require("helmet");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const { softJWTCheck } = require("./../controllers/authController");

module.exports = (app) => {
  app.use(helmet());
  app.use(hpp());
  app.use(mongoSanitize());
  app.use(xss());
  app.use(softJWTCheck);
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: (req) => {
      const requestCount = req.user?.role === "moderator" ? 500 : 100;
      console.log(requestCount);
      return requestCount;
    },
    skip: (req) => req.user?.role === "admin",

    message: "Too many requests from this IP, please try again after 15 minutes.",
    legacyHeaders: false,
    standardHeaders: true,
  });

  app.use("/api/v1", limiter);
};
