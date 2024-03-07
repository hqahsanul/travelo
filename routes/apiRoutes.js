const express = require('express')
const router = express.Router()
const { verifyJWT,cacheMiddleware } = require('../controllers/utils')

const AuthController = require('../controllers/authController')
const UserController = require('../controllers/userController')
const AirportController = require('../controllers/airportController')


router.post('/signup',AuthController.signup)
router.post('/verify-otp',AuthController.verifyOtp)
router.post('/log-in',AuthController.logIn);
router.post('/profile', verifyJWT, AuthController.profile);


router.get('/search', [cacheMiddleware], AirportController.search);
router.get('/search-flight', AirportController.searchFlight);



router.get('/generate-token/:_id',AuthController.generateToken);
router.get('/log-out',verifyJWT,AuthController.logOut);
router.post('/resend-otp',AuthController.resendOtp)
router.post('/forgot-password',AuthController.forgotPassword)
router.post('/reset-password',verifyJWT,AuthController.resetPassword);


router.post('/create-profile', verifyJWT, UserController.createProfile);
router.get('/get-fields', verifyJWT, UserController.getFields);
router.post('/match-profiles', verifyJWT, UserController.matchProfiles);




module.exports = router

