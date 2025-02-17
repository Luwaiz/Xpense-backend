const ExpenseModel = require("../models/ExpenseModel");

const createExpense = async (req, res, next) => {
    console.log(req.user)

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
        console.log(expenses)
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
module.exports = {createExpense, getExpenses};
