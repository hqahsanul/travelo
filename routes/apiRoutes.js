const express = require('express')
const router = express.Router()
const { verifyJWT } = require('../controllers/utils')

const AuthController = require('../controllers/authController')
const UserController = require('../controllers/userController')

router.get('/generate-token/:_id',AuthController.generateToken);
router.post('/log-in',AuthController.logIn);
router.get('/log-out',verifyJWT,AuthController.logOut);
router.post('/verify-otp',AuthController.verifyOtp)
router.post('/resend-otp',AuthController.resendOtp)
router.post('/signup',AuthController.signup)
router.post('/forgot-password',AuthController.forgotPassword)
router.post('/reset-password',verifyJWT,AuthController.resetPassword);


router.post('/create-profile', verifyJWT, UserController.createProfile);
router.get('/get-fields', verifyJWT, UserController.getFields);
router.post('/match-profiles', verifyJWT, UserController.matchProfiles);




module.exports = router

