const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
	const token = req.header("Authorization");

	if (!token) {
		return res.status(401).json({ message: "No token, authorization denied" });
	}
	try {
		const decoded = jwt.verify(token.replace(("Bearer", ""), JWT_SECRET));
		req.user = decoded;
		next();
	} catch (e) {
		res.status(401).json({ message: "Invalid token" });
	}
};

module.exports = authMiddleware;
