require("dotenv").config();
jest.setTimeout(15000); // Increases timeout to 15 seconds

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index"); // Ensure this points to your Express app
const User = require("../models/UserModel");

let testUser = {
	email: "testusers@example.com",
	password: "password123",
	name: "Test User",
};

describe("User Authentication", () => {
	beforeAll(async () => {
		try {
			const mongoURI = process.env.MONGO_URL;

			if (!mongoURI) {
				throw new Error("MongoDB URL is missing. Check your .env file.");
			}

			await mongoose.connect(mongoURI, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				serverSelectionTimeoutMS: 10000, // Wait 10s before timeout
			});

			console.log("✅ Connected to MongoDB for testing");
			await User.deleteMany(); // Clear users before tests start
		} catch (error) {
			console.error("❌ MongoDB Connection Error:", error);
		}
	}, 20000); // Increase Jest timeout to 20s

	afterAll(async () => {
		await mongoose.connection.close();
		console.log("🔴 Disconnected from MongoDB");
	});

	// 🔹 1️⃣ Test User Registration
	it("Should register a new user", async () => {
		const res = await request(app).post("/api/auth/register").send(testUser);

		// 🟢 Log the response before assertions
		console.log("📨 REGISTER RESPONSE:", res.body);

		expect(res.status).toBe(201);
		expect(res.body).toHaveProperty("message", "User registered successfully");
		expect(res.body).toHaveProperty("token");
	});

	// 🔹 2️⃣ Prevent Duplicate Registration
	it("Should prevent duplicate email registration", async () => {
		const res = await request(app).post("/api/auth/register").send(testUser);

		console.log("📨 DUPLICATE REGISTRATION RESPONSE:", res.body);

		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty("message", "Email already in use");
	});

	// 🔹 3️⃣ Test User Login
	it("Should log in an existing user", async () => {
		const res = await request(app).post("/api/auth/login").send({
			email: testUser.email,
			password: testUser.password,
		});

		console.log("📨 LOGIN RESPONSE:", res.body);

		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("message", "User logged in successfully");
		expect(res.body).toHaveProperty("token");
	});

	// // 🔹 4️⃣ Test Forgot Password (OTP Generation)
	// it("Should send a reset code to user's email", async () => {
	// 	const res = await request(app)
	// 		.post("/api/auth/forgotPassword")
	// 		.send({ email: testUser.email });
	// 	expect(res.status).toBe(200);
	// 	expect(res.body).toHaveProperty("message", "Reset code sent successfully");
	// });

	// // 🔹 5️⃣ Test Reset Password (Simulating with a Fake OTP)
	// it("Should verify reset code and allow password reset", async () => {
	// 	const fakeOTP = "123456"; // Assume this is the OTP received

	// 	// Verify OTP
	// 	const verifyRes = await request(app)
	// 		.post("/api/auth/verifyResetCode")
	// 		.send({ email: testUser.email, code: fakeOTP });
	// 	expect(verifyRes.status).toBe(400); // OTPs are generated dynamically

	// 	// Attempt to reset password
	// 	const resetRes = await request(app).post("/api/auth/passwordReset").send({
	// 		email: testUser.email,
	// 		code: fakeOTP,
	// 		newPassword: "newPassword123",
	// 	});
	// 	expect(resetRes.status).toBe(400);
	// });
});
