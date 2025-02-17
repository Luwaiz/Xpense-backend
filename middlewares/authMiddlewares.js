const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
	const authHeader = req.header("Authorization");

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "No token, authorization denied" });
	}

	try {
		// Extract the token by removing "Bearer "
		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (e) {
		res.status(401).json({ message: "Invalid token" });
	}
};

module.exports = authMiddleware;
