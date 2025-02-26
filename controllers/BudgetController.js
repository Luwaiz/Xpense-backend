const BudgetModel = require("../models/BudgetModel");
const ExpenseModel = require("../models/ExpenseModel");

const createBudget = async (req, res) => {
	try {
        const { name, limit, startDate, endDate } = req.body;
        const userId = req.user.userId;

        if (!name || !limit || !startDate || !endDate) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const newBudget = new BudgetModel({
            userId,
            name,
            limit,
            spent: 0,
            startDate,
            endDate
        });

        await newBudget.save();

        res.status(201).json({ message: "Budget created successfully.", budget: newBudget });
    } catch (error) {
        next(error);
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
        const { budgetId } = req.params;
        const userId = req.user.userId;

        const expenses = await ExpenseModel.find({ userId, budgetId }).sort({ date: -1 });

        res.status(200).json(expenses);
    } catch (error) {
        next(error);
    }
};

module.exports = { getBudgets, getExpensesByCategory, createBudget };
