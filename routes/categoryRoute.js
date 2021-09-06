const router = require("express").Router();
const {
  createCategory,
  getCategories,
} = require("../controllers/categoryControllers");
const authorizeUser = require("../middlewares/authorizeUser");
const admin = require("../middlewares/admin");

router
  .route("/")
  .post([authorizeUser, admin], createCategory)
  .get(getCategories);

module.exports = router;
