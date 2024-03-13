const express = require('express')
const router = express.Router()
const { verifyJWT,cacheMiddleware } = require('../controllers/utils')

const AuthController = require('../controllers/authController')
const UserController = require('../controllers/userController')
const AirportController = require('../controllers/airportController')
const HotelController= require('../controllers/hotelController')


router.post('/signup',AuthController.signup)
router.post('/verify-otp',AuthController.verifyOtp)
router.post('/log-in',AuthController.logIn);
router.get('/generate-token/:_id',AuthController.generateToken);
router.get('/log-out',verifyJWT,AuthController.logOut);
router.post('/resend-otp',AuthController.resendOtp)


router.post('/create-profile', verifyJWT, UserController.createProfile);
router.post('/profile', verifyJWT, AuthController.profile);


//=---------------------------------------------Flights--------------------------------
router.get('/search', [cacheMiddleware], AirportController.search);
router.get('/search-flight', AirportController.searchFlight);





//=---------------------------------------------Hotel----------------------------------

// router.post('/save-city', HotelController.SaveCity);
router.get('/search-city', [cacheMiddleware], HotelController.search);
router.get('/search-hotel', HotelController.searchHotel);
router.get('/hotel-info', HotelController.hotelInfo);






module.exports = router

