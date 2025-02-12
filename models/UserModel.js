const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
		},
		password: {
			type: "string",
			required: true,
			minlength: 8,
		},
	},
	{ timestamps: true }
);

UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next(); // ✅ Prevent re-hashing on update

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
    console.log("Entered Password:", password);
    console.log("Stored Hashed Password:", user.password);
    console.log("Password Match:", match);

    if (!match) {
        throw new Error("Invalid password"); // ✅ Throw an error instead of returning a string
    }

    return user;
};

const User = mongoose.model("user", UserSchema);

module.exports = User;
