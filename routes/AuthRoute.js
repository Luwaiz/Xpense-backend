const {
	userSignUp,
	userLogIn,
	emailVerificationCode,
	verifyOTP,
	saveAvatar,
	getProfile,
	updateUser,
	forgotPassword,
	verifyResetCode,
	resetPassword,
} = require("../controllers/AuthController");
const express = require("express");
const authMiddleware = require("../middlewares/authMiddlewares");
const router = express.Router();

router.post("/register", userSignUp);
router.post("/login", userLogIn);
router.post("/reqOTP", emailVerificationCode);
router.post("/verifyOTP", verifyOTP);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyResetCode", verifyResetCode);
router.post("/passwordReset", resetPassword);
router.post("/saveAvatar", authMiddleware, saveAvatar);
router.get("/getProfile", authMiddleware, getProfile);
router.patch("/updateProfile", authMiddleware, updateUser);
module.exports = router;
