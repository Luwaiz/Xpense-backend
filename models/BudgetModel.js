const mongoose = require("mongoose");

const BudgetSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: "string",
        required: true,
    },
    limit: {
        type: "number",
        required: true,
    },
    spent: {
        type: "number",
        default: 0, // Tracks how much has been spent
    }
});

const BudgetModel = mongoose.model("Budget", BudgetSchema);
module.exports = BudgetModel;
