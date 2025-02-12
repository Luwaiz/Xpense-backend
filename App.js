const express = require("express");
const AuthRoute = require("./routes/AuthRoute");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors")
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const MongodbURL = process.env.MONGO_URL;

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use("/api", AuthRoute);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

mongoose.connect(MongodbURL)
.then(()=>{
  console.log("connected to mongodb")
  app.listen(port,() => {
    console.log(`Example app listening on port ${port}`)
  })
}).catch((e)=>{
  console.log(e)
})