const BudgetModel = require("../models/BudgetModel");
const ExpenseModel = require("../models/ExpenseModel");

const createBudget = async (req, res) => {
	try {
		const { category, limit } = req.body;
		const userId = req.user.userId;

		if (!category || !limit) {
			return res
				.status(400)
				.json({ message: "Category and limit are required." });
		}

		// Check if budget for the category already exists
		const existingBudget = await BudgetModel.findOne({ userId, category });

		if (existingBudget) {
			return res
				.status(400)
				.json({ message: "Budget for this category already exists." });
		}

		// Create new budget
		const newBudget = new BudgetModel({
			userId,
			category,
			limit,
			spent: 0,
		});

		await newBudget.save();

		res
			.status(201)
			.json({ message: "Budget created successfully.", budget: newBudget });
	} catch (error) {
		res.status(500).json({ message: "Error creating budget", error });
	}
};

const getBudgets = async (req, res) => {
	try {
		const userId = req.user.userId;
		const budgets = await BudgetModel.find({ userId });

		if (!budgets.length) {
			return res.status(404).json({ message: "No budgets found." });
		}

		res.status(200).json(budgets);
	} catch (error) {
		res.status(500).json({ message: "Error fetching budgets", error });
	}
};

const getExpensesByCategory = async (req, res) => {
	try {
		const userId = req.user.userId;
		const { category } = req.params; // Category is passed as a URL parameter

		const expenses = await ExpenseModel.find({ userId, category }).sort({
			date: -1,
		});

		if (!expenses.length) {
			return res
				.status(404)
				.json({ message: `No expenses found for ${category}` });
		}

		res.status(200).json(expenses);
	} catch (error) {
		res.status(500).json({ message: "Error fetching expenses", error });
	}
};

module.exports = { getBudgets, getExpensesByCategory, createBudget };
