const User = require("../models/UserModel");
const dotenv = require("dotenv");
const generateToken = require("../Utils/jwtGenerate");
dotenv.config();

const userSignUp = async (req, res, next) => {
	try {
		const { name, email, password } = req.body;
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "Email already in use" });
		}

		// Create a new user
		const newUser = new User({ name, email, password });
		await newUser.save();
		console.log(newUser);
		const token = generateToken(newUser._id, newUser.email);
		const userWithoutPassword = {
			_id: newUser._id,
			name: newUser.name,
			email: newUser.email,
			createdAt: newUser.createdAt,
			updatedAt: newUser.updatedAt,
		};

		res.status(201).json({
			message: "User registered successfully",
			token,
			user: userWithoutPassword,
		});
	} catch (error) {
		next(error);
		// console.log(error.message);
		// res.status(500).json({ message: "Server error", error: error.message });
	}
};

const userLogIn = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.login(email, password);
		console.log("User", user);

		const token = generateToken(user._id, user.email);
		const userWithoutPassword = {
			_id: user._id,
			name: user.name,
			email: user.email,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};

		res.status(200).json({
			message: "User logged in successfully",
			token,
			user: userWithoutPassword,
		});
	} catch (e) {
		console.log(e);
		res.status(500).json({ message: "Server error", error: e.message });
	}
};

module.exports = { userSignUp, userLogIn };
