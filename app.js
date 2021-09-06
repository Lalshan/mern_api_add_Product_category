require("express-async-errors");
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const error = require("./middlewares/error");

const userRouter = require("./routes/userRoute");
const categoryRoute = require("./routes/categoryRoute");
const productRoute = require("./routes/productRoute");

app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/user", userRouter);
app.use("/api/category", categoryRoute);
app.use("/api/product", productRoute);

//error
app.use(error);

module.exports = app;
