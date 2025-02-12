const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// Function to generate a JWT token
const generateToken = (userId, email) => {
	return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "1h" });
};

module.exports = generateToken;
