const BudgetModel = require("../models/BudgetModel");
const ExpenseModel = require("../models/ExpenseModel");

const createExpense = async (req, res, next) => {
	try {
		const { name, amount, category, description, date, budgetId } = req.body;
		const userId = req.user.userId;

		if (!name || !amount || !category || !date) {
			return res
				.status(400)
				.json({ message: "All required fields must be provided." });
		}

		const expenseAmount = parseFloat(amount);

		const newExpense = new ExpenseModel({
			userId,
			name,
			amount: expenseAmount,
			category,
			description,
			date: new Date(date),
			budgetId: budgetId || null,
		});

		await newExpense.save();

		if (budgetId) {
			let budget = await BudgetModel.findOne({ _id: budgetId, userId });

			if (budget) {
				budget.spent += expenseAmount;
				await budget.save();
			} else {
				console.warn(`Budget not found with ID: ${budgetId}`);
			}
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
			.limit(3);
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

		// Initialize an object with all days set to zero
		const weeklyData = {
			Sunday: { totalAmount: 0, expenses: [], date: null },
			Monday: { totalAmount: 0, expenses: [], date: null },
			Tuesday: { totalAmount: 0, expenses: [], date: null },
			Wednesday: { totalAmount: 0, expenses: [], date: null },
			Thursday: { totalAmount: 0, expenses: [], date: null },
			Friday: { totalAmount: 0, expenses: [], date: null },
			Saturday: { totalAmount: 0, expenses: [], date: null },
		};

		expenses.forEach((expense) => {
			const day = new Date(expense.date).toLocaleDateString("en-US", {
				weekday: "long",
			});
			weeklyData[day].totalAmount += expense.amount;
			weeklyData[day].expenses.push(expense);
			weeklyData[day].date = expense.date;
		});

		// Convert the object into an array
		const formattedData = Object.keys(weeklyData).map((day) => ({
			day,
			totalAmount: weeklyData[day].totalAmount,
			expenses: weeklyData[day].expenses,
			date: weeklyData[day].date,
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
			const month = new Date(expense.date).toLocaleString("en-US", {
				month: "long",
			});
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
const getExpenseById = async (req, res, next) => {
	try {
		const { expenseId } = req.params;
		const userId = req.user.userId; // Ensure the user only accesses their own expenses

		const expense = await ExpenseModel.findOne({ _id: expenseId, userId });

		if (!expense) {
			return res.status(404).json({ message: "Expense not found" });
		}

		res.status(200).json(expense);
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createExpense,
	getExpenses,
	getRecentExpenses,
	getWeeklyExpenses,
	getMonthlyExpenses,
	getExpenseById,
};
