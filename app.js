const express = require("express");
const app = express();
const AppError = require("./utils/appError");
const morgan = require("morgan");
const applySecurity = require("./utils/security");
const passport = require("passport");
require("./config/passport");
//

app.use(express.json({ limit: "10kb" }));

applySecurity(app);
app.use(passport.initialize());
app.use(morgan("dev"));
app.use("/api/v1/books", require("./routes/bookRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/my-cart", require("./routes/cartRoutes"));
app.use("/api/v1/orders", require("./routes/orderRoutes"));
app.use(express.static("public"));
app.use("*", (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server`));
});
app.use(require("./controllers/errorHandlers"));
module.exports = app;
