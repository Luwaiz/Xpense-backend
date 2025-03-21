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
	saveToken,
} = require("../controllers/AuthController");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddlewares");

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
router.patch("/savePushToken", authMiddleware, saveToken);

module.exports = router;
