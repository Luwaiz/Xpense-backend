const BudgetModel = require("../models/BudgetModel");
const ExpenseModel = require("../models/ExpenseModel");

const createBudget = async (req, res) => {
	try {
        const { name, limit } = req.body;
        const userId = req.user.userId;

        if (!name || !limit) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const newBudget = new BudgetModel({
            userId,
            name,
            limit,
            spent: 0,
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
		const budgets = await BudgetModel.find({ userId }).select("name limit spent createdAt"); // Ensure createdAt is included

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

        // Find budget details
        const budget = await BudgetModel.findOne({ _id: budgetId, userId });

        if (!budget) {
            return res.status(404).json({ message: "Budget not found." });
        }

        // Find all expenses under the budget
        const expenses = await ExpenseModel.find({ userId, budgetId }).sort({ date: -1 });

        res.status(200).json({
            budget, // Budget information
            expenses, // List of expenses under this budget
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching expenses", error });
    }
};


const updateBudget = async (req, res) => {
    try {
        const { budgetId } = req.params;
        const { name, limit } = req.body;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(budgetId)) {
            return res.status(404).json({ message: "Invalid budget ID." });
        }

        const updatedBudget = await BudgetModel.findOneAndUpdate(
            { _id: budgetId, userId },
            { $set: { name, limit } },
            { new: true }
        );

        if (!updatedBudget) {
            return res.status(404).json({ message: "Budget not found." });
        }

        res.status(200).json({ message: "Budget updated successfully.", budget: updatedBudget });
    } catch (error) {
        console.error("Error updating budget:", error);
        res.status(500).json({ message: "Error updating budget", error });
    }
};


const deleteBudget = async (req, res) => {
    try {
        const { budgetId } = req.params;
        const userId = req.user.userId;

        // Find and delete the budget
        const deletedBudget = await BudgetModel.findOneAndDelete({ _id: budgetId, userId });

        if (!deletedBudget) {
            return res.status(404).json({ message: "Budget not found." });
        }

        // Delete all expenses associated with this budget
        await ExpenseModel.deleteMany({ budgetId });

        res.status(200).json({ message: "Budget and associated expenses deleted successfully.", budget: deletedBudget });
    } catch (error) {
        res.status(500).json({ message: "Error deleting budget", error });
    }
};

module.exports = { getBudgets, getExpensesByCategory, createBudget , updateBudget, deleteBudget};
