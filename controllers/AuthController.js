const User = require("../models/UserModel");
const dotenv = require("dotenv");
const generateToken = require("../Utils/jwtGenerate");
const randomString = require("randomstring");
const nodemailer = require("nodemailer");
const OTPModel = require("../models/OTPModel");
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

const generateOtp = async () => {
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
		const expiryDate = Date.now() + 5 * 60 * 1000;
		await OTPModel.findOneAndDelete({ email });

		await OTPModel.create({ otp, email, expiryDate });
		sendOTP(email, otp);

		res.status(200).json({ message: "OTP sent successfully", otp });
	} catch (error) {
		console.log(error);
		next(error);
	}
};

const verifyOTP = async (req, res, next) => {
	try {
		const { email, otp } = req.body;
		const OtpRecord = await OTPModel.findOne({ email });
		if (!OtpRecord) {
			return res.status(400).json({ message: "OTP not found for this email" });
		}
		if (Date.now() > OtpRecord.expiryDate) {
			await OTPModel.deleteOne({ email });
			return res
				.status(400)
				.json({ message: "OTP has expired. Request a new one." });
		}
		if (OtpRecord.otp.trim() === otp.trim()) {
			await OTPModel.deleteOne({ email });
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
