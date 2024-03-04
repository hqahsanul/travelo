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
    const {
      emailMobile,
      profileFor,
      password,
      lat,
      lng,
      deviceToken,
      deviceId,
      deviceType,
    } = req.body;

    try {
      
      let email = '', mobile = '';

      let validEmail = isEmail(emailMobile);
      let validMobile = isValidMobileNumber(emailMobile);

      let user = await User.findOne({ $or: [{ email: emailMobile }, { mobile: emailMobile }] })

      if (validEmail) {
        email = emailMobile
      }

      if (validMobile) {
        mobile = emailMobile
      }

      if(!validEmail && !validMobile) {
        return res.status(400).send({ success: false, msg: 'Invalid email or mobile', data: {} })
      }

      if (!user) {
        // const otp = generateOtp();
        const otp = '1234';
        const hashedPassword = await bcrypt.hash(password, 10);
        const emailToken = randomString(12);
        const newUser = new User({
          email : email,
          mobile: mobile,
          password: hashedPassword,
          profileFor,
          otp,
          deviceToken,
          deviceId,
          deviceType,
          loc: { coordinates: [lng, lat] },
          authTokenIssuedAt: utcDateTime().valueOf(),
          emailToken,
          isVerified: false,
        });

        // Save the new user
        let savedUser = await newUser.save();

        if(mobile){
            // Send OTP asynchronously
          
            const newUserResult = await newUser.save()
    
            const userJson = newUserResult.toJSON();
            ["password", "authTokenIssuedAt", "otp", "emailToken", "__v"].forEach((key) => delete userJson[key] );

            return res.success({ token: emailToken, user: userJson },"Please verify OTP to complete registration");
        } 
        else {
            
          let userJson = savedUser.toJSON();
          ['password','schoolCode','authTokenIssuedAt','otp','verify_token','__v'].forEach(key => delete userJson[key]);
          return res.success({token: emailToken, user: userJson },'Please verify otp for successful registration');                   
        }
      }
      else if(user && !user.isVerified) {
        await User.deleteOne({ _id: user._id });
          // const otp = generateOtp();
          const otp = '1234';
        const hashedPassword = await bcrypt.hash(password, 10);
        const emailToken = randomString(12);
        const newUser = new User({
          email : email,
          mobile: mobile,
          password: hashedPassword,
          otp,
          profileFor,
          deviceToken,
          deviceId,
          deviceType,
          loc: { coordinates: [lng, lat] },
          authTokenIssuedAt: utcDateTime().valueOf(),
          emailToken,
          isVerified: false,
        });

        // Save the new user
        let savedUser = await newUser.save();

        if(mobile){
           
            const newUserResult = await newUser.save()
    
            const userJson = newUserResult.toJSON();
            ["password", "authTokenIssuedAt", "otp", "emailToken", "__v"].forEach(
              (key) => delete userJson[key]
            );

            return res.success({ token: emailToken, user: userJson },"Please verify OTP to complete registration");
        } 
        else {

          let userJson = savedUser.toJSON();
          ['password','schoolCode','authTokenIssuedAt','otp','verify_token','__v'].forEach(key => delete userJson[key]);
          return res.success({token: emailToken, user: userJson },'Please verify otp for successful registration');
            
                                
        }

      }
      else {
        return res.status(403).send({ success: false, msg: "User already exist", data: {} })
      }

    } catch (err) {
      console.error(err);
      return next(err);
    }
  }

  async verifyOtp(req, res, next) {
    const { otp, emailMobile, token } = req.body;
    try {

      let user = await User.findOne({ $or: [{ email: emailMobile }, { mobile: emailMobile }]  });

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
        emailMobile,
        password,
        lat,
        lng,
        deviceToken,
        deviceId,
        deviceType,
      } = req.body;

      let user = await User.findOne({ $or: [{ email: emailMobile }, { mobile: emailMobile }], isVerified: true})
      if (!user) {
        return res.status(404).json({ success: false, msg: "User not found", data: {} });
      }
      if (user.isSuspended) {
        return res.status(403).json({ success: false, msg: "Account suspended from admin", data: {} });
      }

      const passwordMatch = bcrypt.compareSync(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ success: false, msg: "Invalid credentials", data: {} });
      }

      user.authTokenIssuedAt = utcDateTime().valueOf();
      user.deviceToken = deviceToken;
      user.deviceId = deviceId;
      user.deviceType = deviceType;
      user.loc = { coordinates: [lng, lat] };
      await user.save();
      const userJson = user.toJSON();

      const jwttoken = signJWT(userJson);

      delete userJson.password;
      delete userJson.authTokenIssuedAt;
      delete userJson.otp;
      delete userJson.resetToken;
      delete userJson.__v;

      userJson.jwt = jwttoken;
      let progress =  userJson.progress
      let validProgress = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

      if(validProgress.includes(progress)){
        return res.success({ progress: progress, user: userJson }, "Login success.Please complete your profile");
      }
      return res.success({ progress: progress, user: userJson }, "Login success");
    } catch (err) {
      console.log(err);
      return next(err);
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
