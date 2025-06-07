const mongoose = require("mongoose");
const app = require("./app");
const dotenv = require("dotenv").config({ path: "./config.env" });
const db = process.env.DB;

const server = app.listen(3000, "127.0.0.1", () => console.log("app is running"));

mongoose.connect(db).then(() => console.log("DB Connected"));
