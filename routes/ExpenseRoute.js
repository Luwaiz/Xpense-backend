const express = require("express");
const {
	getExpenses,
	createExpense,
	getRecentExpenses,
} = require("../controllers/ExpenseController");
const authMiddleware = require("../middlewares/authMiddlewares");
const router = express.Router();

router.post("/createExpense", authMiddleware, createExpense);
router.get("/getExpenses", authMiddleware, getExpenses);
router.get("/recentExpenses", authMiddleware, getRecentExpenses);

module.exports = router;
