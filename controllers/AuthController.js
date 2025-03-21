const User = require("../models/UserModel");
const dotenv = require("dotenv");
const generateToken = require("../Utils/jwtGenerate");
const randomString = require("randomstring");
const nodemailer = require("nodemailer");
const OTPModel = require("../models/OTPModel");

const generateResetCode = () => {
	return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
};
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

		const token = generateToken(user._id, user.email);
		const userWithoutPassword = {
			_id: user._id,
			name: user.name,
			email: user.email,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};

		console.log(userWithoutPassword);

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
		from: "Xpense",
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

const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		// Check if user exists
		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: "User not found" });

		// Generate and save reset code
		const resetCode = generateResetCode();
		user.resetCode = resetCode;
		user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // Code valid for 10 minutes
		await user.save();

		// Send OTP via email
		await sendResetCodeEmail(user.email, resetCode);

		res.status(200).json({ message: "Reset code sent successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error processing request", error });
	}
};

// 🔹 2️⃣ Send OTP via Email
const sendResetCodeEmail = async (email, code) => {
	let transporter = nodemailer.createTransport({
		service: "Gmail",
		auth: {
			user: process.env.EMAIL_USER, // Use env variables
			pass: process.env.EMAIL_PASS,
		},
		tls: { rejectUnauthorized: false },
	});

	await transporter.sendMail({
		from: "Xpense Support <no-reply@xpense.com>",
		to: email,
		subject: "Password Reset Code",
		text: `Your password reset code is:
			   ${code}
			   This code expires in 10 minutes.`,
	});
};

// 🔹 3️⃣ Verify Reset Code
const verifyResetCode = async (req, res) => {
	try {
		const { email, code } = req.body;

		// Find user
		const user = await User.findOne({ email, resetCode: code });

		if (!user)
			return res.status(400).json({ message: "Invalid or expired reset code" });

		// Check if the code is expired
		if (Date.now() > user.resetCodeExpires) {
			return res.status(400).json({ message: "Reset code expired" });
		}

		res.status(200).json({ message: "Code verified successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error verifying reset code", error });
	}
};

// 🔹 4️⃣ Reset Password
const resetPassword = async (req, res) => {
	try {
		const { email, code, newPassword } = req.body;

		// Find user with matching email and reset code
		const user = await User.findOne({ email, resetCode: code });

		if (!user)
			return res.status(400).json({ message: "Invalid reset request" });

		// Check if code is expired
		if (Date.now() > user.resetCodeExpires) {
			return res.status(400).json({ message: "Reset code expired" });
		}

		// Hash new password
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);

		// Clear reset fields
		user.resetCode = undefined;
		user.resetCodeExpires = undefined;

		await user.save();

		res
			.status(200)
			.json({ message: "Password reset successful. You can now log in." });
	} catch (error) {
		res.status(500).json({ message: "Error resetting password", error });
	}
};

const saveAvatar = async (req, res) => {
	try {
		// Extract user ID from JWT authentication
		const userId = req.user.userId; // ✅ Ensure this matches your auth middleware

		// Check if user exists in the database
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Update the avatar URL and save
		user.avatarUrl = req.body.avatarUrl;
		await user.save(); // ✅ Save to database

		res.json({ success: true, avatarUrl: user.avatarUrl });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.userId).select("-password"); // Exclude password

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({ success: true, user });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const updateUser = async (req, res) => {
	try {
		const id = req.user.userId; // Extract userId from token
		const updates = req.body; // Fields to update

		const updatedUser = await User.findOneAndUpdate({ _id: id }, updates, {
			new: true,
			runValidators: true,
		});
		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		res
			.status(200)
			.json({ message: "Profile updated successfully", user: updatedUser });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error updating profile", error: error.message });
	}
};

const saveToken = async (req, res) => {
	try {
	  const { pushToken } = req.body;
	  const userId = req.user.userId; // Get user from authentication middleware
  
	  if (!pushToken) {
		return res.status(400).json({ message: "Push token is required." });
	  }
  
	  // ✅ Update user's push token
	  await User.findByIdAndUpdate(userId, { pushToken });
  
	  res.json({ message: "Push token saved successfully." });
	} catch (error) {
	  console.error("Error saving push token:", error);
	  res.status(500).json({ message: "Internal server error" });
	}
  }
  

module.exports = {
	userSignUp,
	userLogIn,
	emailVerificationCode,
	verifyOTP,
	saveAvatar,
	getProfile,
	updateUser,
	forgotPassword,
	verifyResetCode,
	resetPassword,
	saveToken,
};
