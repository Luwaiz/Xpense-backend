const {userSignUp,userLogIn, emailVerificationCode, verifyOTP} = require("../controllers/AuthController");
const express = require("express");
const router = express.Router();

router.post("/register", userSignUp);
router.post ("/login", userLogIn);
router.post ("/reqOTP", emailVerificationCode);
router.post ("/verifyOTP", verifyOTP);


module.exports = router;