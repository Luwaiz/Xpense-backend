const User = require("../models/UserModel");
const dotenv = require("dotenv");
const generateToken = require("../Utils/jwtGenerate");
const randomString = require("randomstring");
const nodemailer = require("nodemailer");
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

const OTPCache = {};
const generateOtp = async (req, res) => {
	return (OTP = randomString.generate({ length: 6, charset: "numeric" }));
};

const sendOTP = (email, otp) => {
	const mailOptions = {
		from: "emmaeluwa2021@gmail.com",
		to: email,
		subject: "OTP Verification Code",
		text: `Your OTP is: ${otp}`,
	};

	let Transporter = nodemailer.createTransport({
		service: "Gmail",
		auth: {
			user: "emmaeluwa2021@gmail.com",
			pass: "hnsl yatc eplg yisx",
		},
		tls: {
			rejectUnauthorized: false,
		},
	});

	Transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error);
		} else {
			console.log("Email sent: ", info.response);
		}
	});
};

const emailVerificationCode = async (req, res, next) => {
	try {
		const { email } = req.body;
		const otp = await generateOtp();
		const expiryDate = Date.now() + 2 * 60 * 1000;

		OTPCache[email] = { otp, expiryDate };
		sendOTP(email, otp);
		console.log("Email verified: ", email);
		res.status(200).json({ message: "OTP sent successfully", otp });
	} catch (error) {
		console.log(error);
		next(error);
	}
};

const verifyOTP = async (req, res, next) => {
	try {
		const { email, otp } = req.body;
		console.log(OTPCache);

		if (!OTPCache.hasOwnProperty(email)) {
			return res.status(400).json({ message: "OTP not found for this email" });
		}
		const { otp: storedOtp, expiryDate } = OTPCache[email];
		if (Date.now() > expiryDate) {
			delete OTPCache[email];
			return res
				.status(400)
				.json({ message: "OTP has expired. Request a new one." });
		}
		if (storedOtp.trim() === otp.trim()) {
			delete OTPCache[email];
			return res.status(200).json({ message: "OTP verified successfully" });
		} else {
			return res.status(400).json({ message: "Invalid OTP" });
		}
	} catch (error) {
		console.log(error);
		next(error);
	}
};

module.exports = { userSignUp, userLogIn, emailVerificationCode, verifyOTP };
