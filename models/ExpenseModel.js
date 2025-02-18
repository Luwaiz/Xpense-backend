const  mongoose  = require("mongoose");

const ExpenseSchema =  mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // This references the User collection
        required: true
    },
    name: {
        type: "string",
        required: true
    },
    amount: {
        type: "number",
        required: true
    },
    category: {
        type: "string",
        required: true
    },
    description: {
        type: "string",
        required: false
    },
    date: {
        type: "date",
        default: Date.now
    }
})

const ExpenseModel = mongoose.model("Expense",ExpenseSchema)
module.exports = ExpenseModel