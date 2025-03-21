const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { isEmail } = require("validator");

const UserSchema = mongoose.Schema(
	{
		name: {
			type: "string",
			required: true,
			trim: true,
		},
		email: {
			type: "string",
			required: true,
			unique: true,
			trim: true,
			validate: [isEmail, "Please enter a valid email"],
		},
		password: {
			type: "string",
			required: true,
			minlength: [8, "Password must be at least 8 characters long"],
		},
		avatarUrl: {
			type: "string",
			default: "",
		},
		pushToken: {
			type: "string", // Firebase Cloud Messaging token
		},
		resetCode: { type: "string" }, // OTP
		resetCodeExpires: { type: "date" }, // Expiry time
	},
	{ timestamps: true }
);

UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next(); // Prevent re-hashing on update

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// Method to compare hashed password during login
UserSchema.statics.login = async function (email, password) {
	const user = await this.findOne({ email });

	if (!user) {
		throw new Error(`Cannot find user with the email ${email}`);
	}

	const match = await bcrypt.compare(password, user.password);

	if (!match) {
		throw new Error("Invalid password");
	}

	return user;
};

const User = mongoose.model("user", UserSchema);

module.exports = User;
