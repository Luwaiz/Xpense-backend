const BudgetModel = require("../models/BudgetModel");
const ExpenseModel = require("../models/ExpenseModel");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

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
		const startOfYear = new Date(new Date().getFullYear(), 0, 1);
		startOfYear.setHours(0, 0, 0, 0);

		// Fetch all expenses for the current year
		const expenses = await ExpenseModel.find({
			userId,
			date: { $gte: startOfYear },
		}).sort({ date: 1 });

		// Initialize object to store expenses grouped by month
		const monthlyData = {
			January: { totalAmount: 0, expenses: [] },
			February: { totalAmount: 0, expenses: [] },
			March: { totalAmount: 0, expenses: [] },
			April: { totalAmount: 0, expenses: [] },
			May: { totalAmount: 0, expenses: [] },
			June: { totalAmount: 0, expenses: [] },
			July: { totalAmount: 0, expenses: [] },
			August: { totalAmount: 0, expenses: [] },
			September: { totalAmount: 0, expenses: [] },
			October: { totalAmount: 0, expenses: [] },
			November: { totalAmount: 0, expenses: [] },
			December: { totalAmount: 0, expenses: [] },
		};

		// Group expenses by month
		expenses.forEach((expense) => {
			const month = new Date(expense.date).toLocaleString("en-US", {
				month: "long",
			});
			monthlyData[month].totalAmount += expense.amount;
			monthlyData[month].expenses.push(expense);
		});

		// Convert object into an array
		const formattedData = Object.keys(monthlyData).map((month) => ({
			month,
			totalAmount: monthlyData[month].totalAmount,
			expenses: monthlyData[month].expenses,
		}));

		res.status(200).json({ monthlyData: formattedData });
	} catch (err) {
		res.status(500).json({ message: "Error fetching monthly expenses", err });
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

const updateExpense = async (req, res) => {
	try {
		const { expenseId } = req.params;
		const { name, amount, category, description } = req.body;
		const userId = req.user.userId;

		// Ensure at least one field is provided for update
		if (!name && !amount && !category && !description) {
			return res
				.status(400)
				.json({ message: "Provide at least one field to update." });
		}

		// Build update object dynamically
		const updateFields = {};
		if (name !== undefined) updateFields.name = name;
		if (amount !== undefined) updateFields.amount = amount;
		if (category !== undefined) updateFields.category = category;
		if (description !== undefined) updateFields.description = description;

		// Find and update the expense
		const updatedExpense = await ExpenseModel.findOneAndUpdate(
			{ _id: expenseId, userId },
			{ $set: updateFields },
			{ new: true }
		);

		if (!updatedExpense) {
			return res.status(404).json({ message: "Expense not found." });
		}

		res.status(200).json({
			message: "Expense updated successfully.",
			expense: updatedExpense,
		});
	} catch (error) {
		res.status(500).json({ message: "Error updating expense", error });
	}
};

const deleteExpense = async (req, res) => {
	try {
		const { expenseId } = req.params;
		const userId = req.user.userId;

		// Find and delete the expense
		const deletedExpense = await ExpenseModel.findOneAndDelete({
			_id: expenseId,
			userId,
		});

		if (!deletedExpense) {
			return res.status(404).json({ message: "Expense not found." });
		}

		res.status(200).json({
			message: "Expense deleted successfully.",
			expense: deletedExpense,
		});
	} catch (error) {
		res.status(500).json({ message: "Error deleting expense", error });
	}
};

const exportsDir = path.join(__dirname, "../../exports");
if (!fs.existsSync(exportsDir)) {
	fs.mkdirSync(exportsDir, { recursive: true });
}

const downloadExcel = async (req, res) => {
	try {
		const { startDate, endDate, category } = req.query;
		const userId = req.user.userId;

		let filter = { userId };

		// ✅ Fix Date Filtering (Ensure correct time range)
		if (startDate && endDate) {
			filter.date = {
				$gte: new Date(startDate + "T00:00:00.000Z"),
				$lte: new Date(endDate + "T23:59:59.999Z"),
			};
		}

		// ✅ Fix Category Filtering (Case-insensitive & prevent "All Categories")
		if (category && category !== "All Categories") {
			filter.category = { $regex: new RegExp(`^${category}$`, "i") };
		}

		console.log("📌 Applied Filter:", JSON.stringify(filter, null, 2));

		// 🔍 Check if the database query runs correctly
		const expenses = await ExpenseModel.find(filter);
		console.log("📄 Expenses Found:", expenses.length, "records");

		if (!expenses.length) {
			console.log("❌ No expenses found.");
			return res
				.status(404)
				.json({ message: "No expenses found for the selected filters." });
		}

		console.log("✅ Proceeding to generate Excel file...");

		// ✅ Generate Excel File (Continue with your Excel generation logic)
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Expenses");

		worksheet.columns = [
			{ header: "Name", key: "name", width: 25 },
			{ header: "Amount", key: "amount", width: 15 },
			{ header: "Category", key: "category", width: 20 },
			{ header: "Description", key: "description", width: 30 },
			{ header: "Date", key: "date", width: 20 },
		];

		expenses.forEach((expense) => {
			worksheet.addRow({
				name: expense.name,
				amount: expense.amount,
				category: expense.category,
				description: expense.description,
				date: expense.date.toISOString().split("T")[0],
			});
		});

		const filePath = path.join(
			__dirname,
			`../../exports/expenses_${userId}.xlsx`
		);
		await workbook.xlsx.writeFile(filePath);

		console.log("✅ Excel file generated:", filePath);

		res.download(filePath, "expenses.xlsx", (err) => {
			if (err) {
				console.error("❌ File Download Error:", err);
				return res.status(500).json({ message: "Error downloading file" });
			}
			fs.unlinkSync(filePath);
			console.log("🗑️ File deleted after sending.");
		});
	} catch (error) {
		console.error("🚨 Error:", error);
		res.status(500).json({ message: "Error generating Excel file", error });
	}
};

// 📌 Generate & Download PDF File
const downloadPDF = async (req, res) => {
	try {
		const { startDate, endDate, category } = req.query;
		const userId = req.user.userId;

		let filter = { userId };

		// ✅ Fix Date Filtering (Ensure correct time range)
		if (startDate && endDate) {
			filter.date = {
				$gte: new Date(startDate + "T00:00:00.000Z"),
				$lte: new Date(endDate + "T23:59:59.999Z"),
			};
		}

		// ✅ Fix Category Filtering (Case-insensitive & prevent "All Categories")
		if (category && category !== "All Categories") {
			filter.category = { $regex: new RegExp(`^${category}$`, "i") };
		}

		console.log("📌 Applied Filter:", JSON.stringify(filter, null, 2));

		// 🔍 Check if the database query runs correctly
		const expenses = await ExpenseModel.find(filter);
		console.log("📄 Expenses Found:", expenses.length, "records");

		if (!expenses.length) {
			console.log("❌ No expenses found.");
			return res
				.status(404)
				.json({ message: "No expenses found for the selected filters." });
		}

		console.log("✅ Proceeding to generate PDF file...");

		// ✅ Create PDF Document
		const doc = new PDFDocument();
		const filePath = path.join(__dirname, `../../exports/expenses_${userId}.pdf`);
		const writeStream = fs.createWriteStream(filePath);
		doc.pipe(writeStream);

		// ✅ PDF Header
		doc.fontSize(20).text("Expense Report", { align: "center" });
		doc.moveDown(1);

		// ✅ Add expenses in table format
		expenses.forEach((expense, index) => {
			doc
				.fontSize(14)
				.text(`${index + 1}. ${expense.name} - ₦${expense.amount}`, {
					align: "left",
				});
			doc
				.fontSize(12)
				.text(
					`Category: ${expense.category} | Date: ${
						expense.date.toISOString().split("T")[0]
					}`,
					{ align: "left" }
				);
			doc.moveDown(1);
		});

		doc.end();

		writeStream.on("finish", () => {
			console.log("✅ PDF file generated:", filePath);

			res.download(filePath, "expenses.pdf", (err) => {
				if (err) {
					console.error("❌ File Download Error:", err);
					return res.status(500).json({ message: "Error downloading file" });
				}
				fs.unlinkSync(filePath); // ✅ Delete file after sending
				console.log("🗑️ File deleted after sending.");
			});
		});
	} catch (error) {
		console.error("🚨 Error:", error);
		res.status(500).json({ message: "Error generating PDF file", error });
	}
};


module.exports = {
	createExpense,
	getExpenses,
	getRecentExpenses,
	getWeeklyExpenses,
	getMonthlyExpenses,
	getExpenseById,
	updateExpense,
	deleteExpense,
	downloadExcel,
	downloadPDF,
};
