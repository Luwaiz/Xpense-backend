const express = require("express");
const router = express.Router();
const {
	createProduct,
	getProducts,
	getProductById,
} = require("../controllers/ProductController");

router.post("/create", createProduct); // Create
router.get("/getProducts", getProducts); // Get all
router.get("/getProduct/:id", getProductById);

module.exports = router;
