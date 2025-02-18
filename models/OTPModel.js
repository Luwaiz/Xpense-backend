const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
	email: { type: "string", required: true, unique: true },
	otp: { type: "string", required: true },
	expiryDate: { type: "date", required: true },
});

const OTPModel = mongoose.model("OTP", otpSchema);

module.exports = OTPModel;
