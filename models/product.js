const { model, Schema } = require("mongoose");
const joi = require("joi");

module.exports.Product = model(
  "Product",
  Schema(
    {
      name: String,
      description: String,
      price: Number,
      quantity: Number,
      photo: {
        data: Buffer,
        contentType: String,
      },
      category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    },
    { timestamps: true }
  )
);

module.exports.validate = (product) => {
  const schema = joi.object({
    name: joi.string().min(3).max(255).required(),
    description: joi.string().max(255).required(),
    price: joi.number().required(),
    quantity: joi.number().required(),
    category: joi.string().required(),
  });

  return schema.validate(product);
};
