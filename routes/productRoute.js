const router = require("express").Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  getPhoto,
  productFilter,
} = require("../controllers/productController");
const authorizeUser = require("../middlewares/authorizeUser");
const admin = require("../middlewares/admin");

router.route("/").post([authorizeUser, admin], createProduct).get(getProducts);

router
  .route("/:id")
  .get(getProductById)
  .put([authorizeUser, admin], updateProductById);

router.route("/photo/:id").get(getPhoto);

router.route("/filter").post(productFilter);

module.exports = router;
