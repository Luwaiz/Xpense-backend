const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const AuthRoute = require("./routes/AuthRoute");
const ExpenseRoute = require("./routes/ExpenseRoute");
const BudgetRoute = require("./routes/BudgetRoute");
const ProductRoute = require("./routes/ProductRoute");
const errorHandler = require("./middlewares/errorHandler");
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const MongodbURL = process.env.MONGO_URL;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/auth", AuthRoute);
app.use("/api/expense", ExpenseRoute);
app.use("/api/budget", BudgetRoute);
app.use("/api/products", ProductRoute);
app.use(errorHandler);

app.get("/", (req, res) => {
	res.send("Xpense!");
});

mongoose
	.connect(MongodbURL)
	.then(() => {
		console.log("connected to mongodb");
		app.listen(port, () => {
			console.log(`Example app listening on port ${port}`);
		});
	})
	.catch((e) => {
		console.log(e);
	});

	module.exports = app