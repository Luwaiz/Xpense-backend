const  mongoose  = require("mongoose");

const ExpenseSchema =  mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // This references the User collection
        required: true
    },
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const ExpenseModel = mongoose.model("Expense",ExpenseSchema)
module.exports = ExpenseModel