const ProductModel = require("../models/ProductModel");

const createProduct = async (req, res) => {
	try {
		const { name, price, description } = req.body;
		const image = req.file ? req.file.filename : null;
		const newProduct = new ProductModel({
			name,
			price,
			description,
			image,
		});

		await newProduct.save();
		res
			.status(201)
			.json({ message: "Product created successfully.", product: newProduct });
	} catch (e) {
		res.status(500).json({ message: "Error creating product:", error });
	}
};

const getProducts = async (req, res) => {
	try {
		const products = await ProductModel.find(); // Fetch all products
		res.status(200).json(products);
	} catch (error) {
		res.status(500).json({ message: "Error fetching products", error });
	}
};

const getProductById = async (req, res) => {
	try {
		const { id } = req.params;
		const product = await ProductModel.findById(id);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		res.status(200).json(product);
	} catch (error) {
		res.status(500).json({ message: "Error fetching product", error });
	}
};

module.exports = { createProduct, getProducts, getProductById };
