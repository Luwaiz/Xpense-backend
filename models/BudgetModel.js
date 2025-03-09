const mongoose = require("mongoose");

const BudgetSchema = mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		name: {
			type: "string",
			required: true,
		},
		limit: {
			type: "number",
			required: true,
		},
		spent: {
			type: "number",
			default: 0,
		},
	},
	{ timestamps: true }
);

const BudgetModel = mongoose.model("Budget", BudgetSchema);
module.exports = BudgetModel;
