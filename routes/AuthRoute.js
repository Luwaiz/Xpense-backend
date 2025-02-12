const {userSignUp,userLogIn} = require("../controllers/AuthController");
const express = require("express");
const router = express.Router();

router.post("/register", userSignUp);
router.post ("/login", userLogIn)

module.exports = router;