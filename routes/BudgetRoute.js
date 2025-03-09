const express = require("express");
const {
	getBudgets,
	getExpensesByCategory,
	createBudget,
	updateBudget,
	deleteBudget,
} = require("../controllers/BudgetController");
const authMiddleware = require("../middlewares/authMiddlewares");
const router = express.Router();

router.post("/createBudget", authMiddleware, createBudget);
router.get("/getBudgets", authMiddleware, getBudgets);
router.get(
	"/getBudgetCategory/expenses/:budgetId",
	authMiddleware,
	getExpensesByCategory
);
router.put("/:budgetId", authMiddleware, updateBudget);
router.delete("/:budgetId", authMiddleware, deleteBudget); // Delete route
module.exports = router;
