require("dotenv").config();
jest.setTimeout(15000); // Increase timeout for MongoDB operations

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index"); // Ensure this points to the main Express app
const BudgetModel = require("../models/BudgetModel");
const User = require("../models/UserModel");

let testUser = {
	email: "budgetuser@example.com",
	password: "password123",
	name: "Budget User",
};

let authToken = "";
let budgetId = "";

// 🔹 Setup & Cleanup before/after tests
describe("Budget API Tests", () => {
	beforeAll(async () => {
		try {
			const mongoURI = process.env.MONGO_URL;
			if (!mongoURI) throw new Error("MongoDB URL is missing");

			await mongoose.connect(mongoURI, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				serverSelectionTimeoutMS: 10000, // Wait 10s before timeout
			});
			console.log("✅ Connected to MongoDB for Budget Testing");

			await User.deleteMany();
			await BudgetModel.deleteMany();

			// Register & log in a test user
			await request(app).post("/api/auth/register").send(testUser);
			const loginRes = await request(app).post("/api/auth/login").send({
				email: testUser.email,
				password: testUser.password,
			});
			authToken = loginRes.body.token;
			console.log("🔹 Test User Created & Authenticated");
		} catch (error) {
			console.error("❌ MongoDB Connection Error:", error);
		}
	}, 20000); // Increase timeout for setup

	afterAll(async () => {
		await mongoose.connection.close();
		console.log("🔴 Disconnected from MongoDB");
	});

	// 🔹 1️⃣ Test Budget Creation
	it("Should create a new budget", async () => {
		const res = await request(app)
			.post("/api/budget/createBudget")
			.set("Authorization", `Bearer ${authToken}`)
			.send({ name: "Food", limit: 500 });

		console.log("📨 CREATE BUDGET RESPONSE:", res.body);
		expect(res.status).toBe(201);
		expect(res.body).toHaveProperty("message", "Budget created successfully.");
		expect(res.body).toHaveProperty("budget");
		budgetId = res.body.budget._id;
	});

	// 🔹 2️⃣ Test Fetching Budgets
	it("Should fetch all budgets", async () => {
		const res = await request(app)
			.get("/api/budget/getBudgets")
			.set("Authorization", `Bearer ${authToken}`);

		console.log("📨 GET BUDGETS RESPONSE:", res.body);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
	});

	// 🔹 3️⃣ Test Fetching a Budget with Expenses
	it("Should fetch a budget and its expenses", async () => {
		const res = await request(app)
			.get(`/api/budget/getBudgetCategory/expenses/${budgetId}`)
			.set("Authorization", `Bearer ${authToken}`);

		console.log("📨 GET BUDGET CATEGORY RESPONSE:", res.body);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("budget");
		expect(res.body).toHaveProperty("expenses");
	});

	// 🔹 4️⃣ Test Updating a Budget
	it("Should update an existing budget", async () => {
		const res = await request(app)
			.put(`/api/budget/updateBudget/${budgetId}`)
			.set("Authorization", `Bearer ${authToken}`)
			.send({ name: "Updated Food", limit: 600 });

		console.log("📨 UPDATE BUDGET RESPONSE:", res.body);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("message", "Budget updated successfully.");
	});

	// 🔹 5️⃣ Test Preventing Update with Invalid ID
	it("Should return 404 for invalid budget update", async () => {
		const res = await request(app)
			.put("/api/budget/updateBudget/invalidId")
			.set("Authorization", `Bearer ${authToken}`)
			.send({ name: "Invalid", limit: 400 });

		console.log("📨 INVALID UPDATE RESPONSE:", res.body);
		expect(res.status).toBe(404);
	});

	// 🔹 6️⃣ Test Deleting a Budget
	it("Should delete a budget", async () => {
		const res = await request(app)
			.delete(`/api/budget/deleteBudget/${budgetId}`)
			.set("Authorization", `Bearer ${authToken}`);

		console.log("📨 DELETE BUDGET RESPONSE:", res.body);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty(
			"message",
			"Budget and associated expenses deleted successfully."
		);
	});

	// 🔹 7️⃣ Test Preventing Unauthorized Access
	it("Should return 401 Unauthorized when no token is provided", async () => {
		const res = await request(app).get("/api/budget/getBudgets");

		console.log("📨 UNAUTHORIZED ACCESS RESPONSE:", res.body);
		expect(res.status).toBe(401);
	});
});
