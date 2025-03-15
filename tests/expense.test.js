require("dotenv").config();
jest.setTimeout(20000); // Increase Jest timeout for async operations

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../index"); // Import your Express app
const Expense = require("../models/ExpenseModel");
const User = require("../models/UserModel");

let testUser = {
	email: "expenseuser@example.com",
	password: "password123",
	name: "Expense User",
};

let authToken;
let expenseId;

// ✅ Connect to Test Database Before Running Tests
beforeAll(async () => {
	try {
		const mongoURI = process.env.MONGO_URL;
		if (!mongoURI) throw new Error("MongoDB URL is missing. Check .env file.");

		await mongoose.connect(mongoURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			serverSelectionTimeoutMS: 30000, // Wait 30s before timeout
			socketTimeoutMS: 45000,
		});

		console.log("✅ Connected to MongoDB for Expense Testing");

		// Clear previous data
		await Expense.deleteMany();
		await User.deleteMany();

		// 🔹 Register Test User
		const userRes = await request(app).post("/api/auth/register").send(testUser);
		authToken = userRes.body.token || (
			await request(app).post("/api/auth/login").send({
				email: testUser.email,
				password: testUser.password,
			})
		).body.token;

		console.log("🔹 Test User Created & Authenticated");
	} catch (error) {
		console.error("❌ MongoDB Connection Error:", error);
	}
}, 30000); // Increase Jest timeout

afterAll(async () => {
	await mongoose.connection.close();
	console.log("🔴 Disconnected from MongoDB");
});

// 🔹 1️⃣ Create an Expense
it("Should create a new expense", async () => {
	const expenseData = {
		name: "Groceries",
		amount: 100,
		category: "Food",
		description: "Walmart purchase",
		date: new Date().toISOString(),
	};

	const res = await request(app)
		.post("/api/expense/createExpense")
		.set("Authorization", `Bearer ${authToken}`)
		.send(expenseData);

	console.log("📨 CREATE EXPENSE RESPONSE:", res.body);

	expect(res.status).toBe(201);
	expect(res.body).toHaveProperty("message", "Expense created successfully.");
	expect(res.body).toHaveProperty("expense");

	expenseId = res.body.expense._id;
});

// 🔹 2️⃣ Get All Expenses
it("Should fetch all expenses", async () => {
	const res = await request(app)
		.get("/api/expense/getExpenses")
		.set("Authorization", `Bearer ${authToken}`);

	console.log("📨 GET EXPENSES RESPONSE:", res.body);

	expect(res.status).toBe(200);
	expect(Array.isArray(res.body)).toBe(true);
});

// 🔹 3️⃣ Get Recent Expenses
it("Should fetch recent expenses", async () => {
	const res = await request(app)
		.get("/api/expense/recentExpenses")
		.set("Authorization", `Bearer ${authToken}`);

	console.log("📨 RECENT EXPENSES RESPONSE:", res.body);

	expect(res.status).toBe(200);
	expect(Array.isArray(res.body)).toBe(true);
});

// 🔹 4️⃣ Update an Expense
it("Should update an expense", async () => {
	const updatedExpense = {
		name: "Updated Groceries",
		amount: 150,
	};

	const res = await request(app)
		.put(`/api/expense/updateExpenses/${expenseId}`)
		.set("Authorization", `Bearer ${authToken}`)
		.send(updatedExpense);

	console.log("📨 UPDATE EXPENSE RESPONSE:", res.body);

	expect(res.status).toBe(200);
	expect(res.body).toHaveProperty("message", "Expense updated successfully.");
});

// 🔹 5️⃣ Delete an Expense
it("Should delete an expense", async () => {
	const res = await request(app)
		.delete(`/api/expense/deleteExpenses/${expenseId}`)
		.set("Authorization", `Bearer ${authToken}`);

	console.log("📨 DELETE EXPENSE RESPONSE:", res.body);

	expect(res.status).toBe(200);
	expect(res.body).toHaveProperty("message", "Expense deleted successfully.");
});
