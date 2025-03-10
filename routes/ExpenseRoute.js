const express = require("express");
const {
	getExpenses,
	createExpense,
	getRecentExpenses,
	getWeeklyExpenses,
	getMonthlyExpenses,
	getExpenseById,
	updateExpense,
	deleteExpense,
} = require("../controllers/ExpenseController");
const authMiddleware = require("../middlewares/authMiddlewares");
const router = express.Router();

router.post("/createExpense", authMiddleware, createExpense);
router.get("/getExpenses", authMiddleware, getExpenses);
router.get("/getExpenseById/:expenseId", authMiddleware, getExpenseById);
router.get("/recentExpenses", authMiddleware, getRecentExpenses);
router.get("/weeklyExpenses", authMiddleware, getWeeklyExpenses);
router.get("/monthlyExpenses", authMiddleware, getMonthlyExpenses);
router.get("/updateExpenses/:expenseId", authMiddleware, updateExpense);
router.get("/deleteExpenses/:expenseId", authMiddleware, deleteExpense);

module.exports = router;
