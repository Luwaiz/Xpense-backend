const errorHandler = (err, req, res, next) => {
	if (err.name === "ValidationError") {
		const errors = Object.values(err.errors).map((error) => error.message);
		return res.status(400).json({ errors });
	}
	if (err.code === 11000) {
		return res.status(400).json({ errors: ["Email already exists"] });
	}

	res.status(500).json({ message: "Internal Server Error" });
};

module.exports = errorHandler;
