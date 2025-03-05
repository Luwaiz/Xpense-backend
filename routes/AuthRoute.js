const {
	userSignUp,
	userLogIn,
	emailVerificationCode,
	verifyOTP,
	saveAvatar,
	getProfile,
	updateUser,
} = require("../controllers/AuthController");
const express = require("express");
const authMiddleware = require("../middlewares/authMiddlewares");
const router = express.Router();

router.post("/register", userSignUp);
router.post("/login", userLogIn);
router.post("/reqOTP", emailVerificationCode);
router.post("/verifyOTP", verifyOTP);
router.post("/saveAvatar", authMiddleware, saveAvatar);
router.get("/getProfile", authMiddleware, getProfile);
router.patch("/updateProfile/:id", authMiddleware, updateUser);
module.exports = router;
