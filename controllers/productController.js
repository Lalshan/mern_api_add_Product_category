const _ = require("lodash");
const formidable = require("formidable");
const fs = require("fs");
const { Product, validate } = require("../models/product");

module.exports.createProduct = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(400).send("Somethisg went wrong!");

    const { error } = validate(
      _.pick(fields, ["name", "price", "description", "quantity", "category"])
    );
    if (error) return res.status(400).send(error.details[0].message);

    const product = new Product(fields);

    if (files.photo) {
      //<input type="file" name="photo" />
      fs.readFile(files.photo.path, (err, data) => {
        if (err) return res.status(400).send("Problem in file!");

        product.photo.data = data;
        product.photo.contentType = files.photo.type;

        product.save((err, result) => {
          if (err) return res.status(500).send("Server error!");
          else
            return res.status(201).send({
              message: "Product added successfully!",
              data: _.pick(result, [
                "name",
                "price",
                "description",
                "quantity",
                "category",
              ]),
            });
        });
      });
    } else {
      return res.status(400).send("No image provided!");
    }
  });
};

module.exports.getProducts = async (req, res) => {
  //query string
  //api/product?order=desc&sortBy=name&limit=5
  let order = req.query.order === "desc" ? -1 : 1;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const products = await Product.find()
    .select({ photo: 0, description: 0 })
    .sort({ [sortBy]: order })
    .limit(limit)
    .populate("category", "name");
  return res.status(200).send(products);
};

module.exports.getProductById = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId)
    .select({ photo: 0 })
    .populate("category", "name");
  if (!product) return res.status(404).send("Product not found!");
  return res.status(200).send(product);
};

module.exports.getPhoto = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId).select({
    photo: 1,
    _id: 0,
  });

  res.set("Content-Type", product.photo.contentType);
  if (!product) return res.status(404).send("Product photo not found!");
  return res.status(200).send(product.photo.data);
};

module.exports.updateProductById = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);

  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(400).send("Something wrong!");
    const updatedProduct = _.pick(fields, [
      "name",
      "price",
      "description",
      "category",
      "quantity",
    ]);
    _.assignIn(product, updatedProduct);

    if (files.photo) {
      fs.readFile(files.photo.path, (err, data) => {
        if (err) return res.status(400).send("Problem in file!");
        product.photo.data = data;
        product.photo.contentType = files.photo.type;
        product.save((err, result) => {
          if (err) return res.status(500).send("Server error!");
          return res.status(200).send({
            message: "Product updated successfully!",
            //data: result,
          });
        });
      });
    } else {
      product.save((err, result) => {
        if (err) return res.status(500).send("Server error!");
        return res.status(200).send({
          message: "Product updated successfully!",
          // data: _.pick(result, [
          //   "name",
          //   "price",
          //   "description",
          //   "category",
          //   "quantity",
          // ]),
        });
      });
    }
  });
};

const body = {
  order: "desc",
  sortBy: "price",
  limit: 4,
  skip: 20,
  filters: {
    price: [100, 500],
    category: ["61339a56ccc0acff7a988039"],
  },
};

//Product filter
module.exports.productFilter = async (req, res) => {
  let order = req.body.order === "desc" ? -1 : 1;
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = parseInt(req.body.skip);
  let filters = req.body.filters;
  let args = {};

  for (let key in filters) {
    if (filters[key].length > 0) {
      if (key === "price") {
        //{price:{$gte:0,$lte:300}}
        args["price"] = {
          $gte: filters["price"][0],
          $lte: filters["price"][1],
        };
      }
      if (key === "category") {
        args["category"] = {
          $in: filters["category"],
        };
      }
    }
  }

  const products = await Product.find(args)
    .select({ photo: 0, description: 0 })
    .sort({ [sortBy]: order })
    .skip(skip)
    .limit(limit)
    .populate("category", "name");
  return res.status(200).send(products);
};
