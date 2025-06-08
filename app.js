const express = require("express");
const app = express();
const AppError = require("./utils/appError");
const morgan = require("morgan");
const authRouter = require("./routes/authRoutes");
const passport = require("passport");
require("./config/passport");
//

app.use(express.json({ limit: "10kb" }));
app.use(passport.initialize());
app.use(morgan("dev"));
app.use("/api/v1/books", require("./routes/bookRoutes"));
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
// app.use("/api/v1/admin/carts", require("./routes/adminCartRoutes"));
app.use("/api/v1/my-cart", require("./routes/userCartRoutes"));
app.use("/api/v1/reviews", require("./routes/reviewRoutes"));

app.use("*", (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server`));
});
app.use(require("./controllers/errorHandlers"));
module.exports = app;
