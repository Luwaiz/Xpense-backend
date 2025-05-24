const express = require("express");
const router = express.Router();
const {
	createProduct,
	getProducts,
	getProductById,
} = require("../controllers/ProductController");
const upload = require("../middlewares/mutler");

router.post("/create", upload.single("image"), createProduct); // Create
router.get("/getProducts", getProducts); // Get all
router.get("/getProduct/:id", getProductById);

module.exports = router;
