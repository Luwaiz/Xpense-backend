const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
	email: { type: String, required: true, unique: true },
	otp: { type: String, required: true },
	expiryDate: { type: Date, required: true },
});

const OTPModel = mongoose.model("OTP", otpSchema);

module.exports = OTPModel;
