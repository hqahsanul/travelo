const { signJWT } = require("./utils");
const { generateOtp, randomString, utcDateTime } = require("../lib/util");
const { User } = require("../db/models/User.model");
var request = require("request");
const bcrypt = require("bcryptjs");
const sendGridMail = require('@sendgrid/mail');
const fromMail = process.env.FROM_MAIL;
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

class AuthController {

  async signup(req, res, next) {
    const { name, email, mobile, lat, lng, type, deviceToken, deviceId, deviceType } = req.body;
  
    const validEmail = isEmail(email);
    const validMobile = isValidMobileNumber(mobile);
  
    if (!validEmail && !validMobile) {
      return res.status(400).send({ success: false, msg: 'Invalid email or mobile', data: {} });
    }
    //const otp = generateOtp();
    const otp = '1234';
    const emailToken = randomString(12);
  
    const user = await User.findOneAndUpdate(
      { $or: [{ email: email }, { mobile: mobile }] },
      {
        $setOnInsert: {
          email: validEmail ? email : '',
          mobile: validMobile ? mobile : '',
          name,
          deviceToken,
          deviceId,
          type,
          deviceType,
          loc: { coordinates: [lng, lat] },
          authTokenIssuedAt: utcDateTime().valueOf(),
          isVerified: false,
        },
        $set: {
          otp,
          emailToken,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  
    if (!user) {
      return res.status(403).send({ success: false, msg: 'User already exists', data: {} });
    }
  
    const userJson = user.toJSON();
    ['schoolCode', 'authTokenIssuedAt', 'otp', 'verify_token', '__v'].forEach((key) => delete userJson[key]);
  
    return res.success({ token: user.emailToken, user: userJson }, 'Please verify otp for successful registration');
  }
  

  async verifyOtp(req, res, next) {
    const { otp, email,mobile, token } = req.body;
    try {

      let user = await User.findOne({ $or: [{ email: email }, { mobile: mobile }]  });

      if (!user) {
        return res.status(401).json({ success: false, msg: "UNAUTHORIZED", data: {} });
      } 
      if(user.isVerified) {
        return res.status(403).json({ success: false, msg: "Already verified", data: {} });
      }
      else {
        
        if(user.otp == otp){
          if(user.emailToken == token){
            user.isVerified = true;
            user.progress = 1;
            let newUser = await user.save();
            const userJson = newUser.toJSON();
            const jwttoken = signJWT(user);
            userJson.jwt = jwttoken;
            return res.success({ progress: userJson.progress, user: userJson }, "OTP verified. please complete your profile");
          } 
          else if(user.resetToken == token){
            let newUser = await user.save();
            const userJson = newUser.toJSON();
            const jwttoken = signJWT(user);
            userJson.jwt = jwttoken;
            return res.success({ user: userJson }, "OTP verified");
          } 
          else {
            return res.status(401).json({ success: false, msg: "Invalid token", data: { } });
          }
        } 
        else {
          return res.status(401).json({ success: false,msg: "Invalid OTP", data: { } });
        }
      }
    } catch (err) {
      console.log(err)
      return next(err);
    }
  }

  async logIn(req, res, next) {
    try {
      const {
        email,
        lat,
        lng,
        deviceToken,
        deviceId,
        deviceType,
      } = req.body;

      let user = await User.findOne({ email: email})
      if (!user) {
        return res.status(404).json({ success: false, msg: "User not found", data: {} });
      }
      if (user.isSuspended) {
        return res.status(403).json({ success: false, msg: "Account suspended from admin", data: {} });
      }

     const emailToken = randomString(12);
      user.authTokenIssuedAt = utcDateTime().valueOf();
      user.deviceToken = deviceToken;
      user.emailToken=emailToken;
      user.deviceId = deviceId;
      user.deviceType = deviceType;
      user.loc = { coordinates: [lng, lat] };
      let savedUser=await user.save();
      const userJson = savedUser.toJSON();
      delete userJson.authTokenIssuedAt;
      delete userJson.otp;
      delete userJson.resetToken;
      delete userJson.__v;
      return res.success({token: emailToken, user: userJson },'Please verify otp for login');
    
    } catch (err) {
      console.log(err);
      return next(err);
    }
  }
  async profile(req,res,next){
    try{
      let userId = req.user._id;
      let {Aadhar,pan,GST,address} = req.body;
      let user = await User.findOne({_id:userId});
      if(user){
        user.Aadhar = Aadhar;
        user.pan = pan;
        user.GST = GST;
        user.address = address;
        let responseData = await User(user).save();
        return res.status(200).send({
          data:responseData,
          message:"profile update successfully"
        })
      }else{
        return res.status(404).send({
          message:"User node found"
        })
      }

    }catch(err){
      return next(err)
    }
  }

  async generateToken(req, res) {
    let _id = req.params._id;
    const user = await User.findOne({ _id });
    const platform = req.headers["x-hrms-platform"];
    const token = signJWT(user, platform);
    return res.success({
      token,
    });
  }

  async logOut(req, res) {
    const { user } = req;
    user.authTokenIssuedAt = null;
    user.deviceToken = null;
    await user.save();
    return res.success({}, req.__("LOGOUT_SUCCESS"));
  }

  async resendOtp(req, res, next) {
    const { emailMobile, resetToken } = req.body;
    try {
      let email = '', mobile = ''

      let validEmail = isEmail(emailMobile);
      let validMobile = isValidMobileNumber(emailMobile);

      if (validEmail) {
        email = emailMobile
      }

      if (validMobile) {
        mobile = emailMobile
      }

      let user = await User.findOne({ $or : [{ email: emailMobile }, { mobile: emailMobile }], isSuspended : false });

      if (!user) {
        return res.status(401).json({ msg: "UNAUTHORIZED" });
      }
      if (user) {
        if (user.resetToken === resetToken) {
            // const otp = generateOtp();
        const otp = '1234';
          user.otp = otp;
          let savedUser = await user.save();

          if(mobile) {
           
    
        
            const newUserResult = await newUser.save();
    
            const userJson = newUserResult.toJSON();
            ["password", "authTokenIssuedAt", "otp", "emailToken", "__v"].forEach((key) => delete userJson[key]);

            return res.success({ resetToken, user: userJson },"OTP sent successfully");
          }
          else {
            let userJson = savedUser.toJSON();
              ['password','schoolCode','authTokenIssuedAt','otp','verify_token','__v'].forEach(key => delete userJson[key]);
              return res.success({resetToken, user: userJson },'OTP sent successfully');
          }

        } else {
          return res.status(401).json({ msg: "Invalid reset token" });
        }
      }
    } catch (err) {
      return next(err);
    }
  }

  async forgotPassword(req, res, next) {
    const { emailMobile } = req.body;
    try {
      const user = await User.findOne({ $or: [{ email: emailMobile }, { mobile: emailMobile }], isSuspended : false, });

      if (!user) {
        return res.status(401).json({ success: false, msg: "Not registered", data: { } });
      } 
      else if (user) {

        let email = '', mobile = '';
        if (validEmail) {
          email = emailMobile
        }
  
        if (validMobile) {
          mobile = emailMobile
        }

        if(!validEmail && !validMobile) {
          return res.status(400).send({ success: false, msg: 'Invalid email or mobile', data: {} })
        }

        const resetToken = randomString(10);
          // const otp = generateOtp();
          const otp = '1234';

        user.resetToken = resetToken;
        user.otp = otp;
        user.authTokenIssuedAt = utcDateTime().valueOf();
        await user.save();

        if(mobile) {
          const options = {
            url: process.env.FAST_URL,
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: process.env.FAST_KEY,
            },
            body: {
              variables_values: otp,
              route: "otp",
              numbers: mobile,
            },
            json: true,
          };
  
          // Parallelize sending OTP and processing the response
          const newUserResult = await newUser.save();
  
          const userJson = newUserResult.toJSON();
          ["password", "authTokenIssuedAt", "otp", "emailToken", "__v"].forEach((key) => delete userJson[key]);
          return res.success({ resetToken, user: userJson },"OTP sent successfully");
        }
        else {
          
          let userJson = savedUser.toJSON();
          ['password','schoolCode','authTokenIssuedAt','otp','verify_token','__v'].forEach(key => delete userJson[key]);
          return res.success({resetToken, user: userJson },'OTP sent successfully');
        }
      }
    } catch (err) {
      return next(err);
    }
  }

  async resetPassword(req, res, next) {
    const { password, cnfpassword } = req.body;

    try {
      const { _id } = req;
      const user = await User.findOne({ _id });

      if (!user) {
        return res.status(401).json({ msg: "UNAUTHORIZED" });
      }

      if (password === cnfpassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        let savedUser = await user.save();
        let progress = savedUser.progress;
        return res.success({ progress: progress }, "Password reset successfully");
      } else {
        return res.status(401).json({ msg: "Passwords do not match" });
      }
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new AuthController();

function sendOTP(options) {
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        console.error("Error occurred while calling the API:", error.msg);
        reject(error);
      } else {
        if (response.statusCode === 503) {
          resolve({ status: false });
        } else {
          resolve(body);
        }
      }
    });
  });
}

function isEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidMobileNumber(number) {
  //  minimum  8 digits and  maximum 15 digits
  const mobileNumberRegex = /^[+]?\d{8,15}[-\s\./\d]*$/;
  return mobileNumberRegex.test(number);
}
