const BudgetModel = require("../models/BudgetModel");
const ExpenseModel = require("../models/ExpenseModel");

const createExpense = async (req, res, next) => {
	console.log(req.user);

	try {
		const { name, amount, category, description } = req.body;
		const userId = req.user.userId;

		if (!name || !amount || !category) {
			return res
				.status(400)
				.json({ message: "Please provide all required fields." });
		}

		const newExpense = new ExpenseModel({
			userId,
			name,
			amount,
			category,
			description,
		});

		await newExpense.save();
		const budget = await BudgetModel.findOne({ userId, category });

        if (budget) {
            budget.spent += amount;
            await budget.save();
        }


		res
			.status(201)
			.json({ message: "Expense created successfully.", expense: newExpense });
	} catch (error) {
		next(error);
	}
};

const getExpenses = async (req, res, next) => {
	try {
		const userId = req.user.userId;
		const expenses = await ExpenseModel.find({ userId }).sort({ date: -1 });
		console.log(expenses);
		res.status(200).json(expenses);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

const getRecentExpenses = async (req, res) => {
	try {
		const userId = req.user.userId;
		const recentExpenses = await ExpenseModel.find({ userId })
			.sort({ date: -1 })
			.limit(7);
		res.status(200).json(recentExpenses);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
};

const getWeeklyExpenses = async (req, res) => {
	try {
		const userId = req.user.userId;
		const startOfWeek = new Date();
		startOfWeek.setDate(startOfWeek.getDate() - 6);

		const expenses = await ExpenseModel.find({
			userId,
			date: { $gte: startOfWeek },
		});

		const weeklyData = {
			Sunday: 0,
			Monday: 0,
			Tuesday: 0,
			Wednesday: 0,
			Thursday: 0,
			Friday: 0,
			Saturday: 0,
		};

		expenses.forEach((expense) => {
			const day = new Date(expense.date).toLocaleDateString("en-US", {
				weekday: "long",
			});
			console.log(day);
			weeklyData[day] += expense.amount;
		});
		console.log(expenses)

		const formattedData = Object.keys(weeklyData).map((day) => ({
			day,
			amount: weeklyData[day],
		}));

		res.status(200).json({ weeklyData: formattedData });
	} catch (err) {
		res.status(500).json({ message: "Error fetching expenses", err });
		console.log(err);
	}
};

const getMonthlyExpenses = async (req, res) => {
	try {
		const userId = req.user.userId;

		// Get the first day of the current year
		const startOfYear = new Date(new Date().getFullYear(), 0, 1); // Jan 1st
		startOfYear.setHours(0, 0, 0, 0);

		// Fetch all expenses for the current year
		const expenses = await ExpenseModel.find({
			userId,
			date: { $gte: startOfYear }, // Get only this year's expenses
		});

		// Object to store total expenses per month
		const monthlyData = {
			January: 0,
			February: 0,
			March: 0,
			April: 0,
			May: 0,
			June: 0,
			July: 0,
			August: 0,
			September: 0,
			October: 0,
			November: 0,
			December: 0,
		};

		// Loop through expenses and sum up amounts for each month
		expenses.forEach((expense) => {
			const month = new Date(expense.date).toLocaleString("en-US", { month: "long" });
			monthlyData[month] += expense.amount;
		});

		// Convert object to an array of { month, amount }
		const formattedData = Object.keys(monthlyData).map((month) => ({
			month,
			amount: monthlyData[month],
		}));

		res.status(200).json({ yearlyData: formattedData });
	} catch (err) {
		res.status(500).json({ message: "Error fetching yearly expenses", err });
		console.log(err);
	}
};

module.exports = { createExpense, getExpenses, getRecentExpenses,getWeeklyExpenses, getMonthlyExpenses };
