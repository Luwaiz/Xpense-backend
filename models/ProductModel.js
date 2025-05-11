const mongoose = require("mongoose");
const ProductSchema = mongoose.Schema(
	{
		name: {
			type: "string",
			required: true,
		},
		price: {
			type: "number",
			required: true,
		},
		description: {
			type: "string",
			required: true,
		},
	},
	{ timestamps: true }
);

const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = ProductModel;
