const jwt = require('jsonwebtoken')
const { signJWT, verifyJWT } = require('./utils')
const { generateOtp, randomString, utcDateTime } = require('../lib/util')
const mongoose = require('mongoose')
const { User, Wallet, Address } = require('../db/models/User.model')
var request = require('request');
const bcrypt = require('bcryptjs');


class AuthController {

    async logIn(req, res, next) {
        try {
            const { password, mobile, lat, lng } = req.body;
    
            const user = await User.findOne({ mobile }).lean();
    
            if (!user) {
                return res.status(404).json({ msg: 'Not found' });
            }
    
            if (!user.status) {
                return res.status(404).json({ msg: 'Not verified' });
            }
    
          
            const passwordMatch = bcrypt.compareSync(password, user.password);
    
            if (!passwordMatch) {
                return res.status(404).json({ msg: 'Check password and phone' });
            }
    
            
            user.authTokenIssuedAt = utcDateTime().valueOf();
            user.loc = { coordinates: [lat, lng] };
            await user.save();
            const userJson = user.toJSON();
    
            
            const jwttoken = signJWT(userJson);
    
            delete userJson.password;
            delete userJson.authTokenIssuedAt;
            delete userJson.otp;
            delete userJson.resetToken;
            delete userJson.__v;
    
            userJson.jwt = jwttoken;
            return res.success({ user:userJson }, 'Login Success');
        } catch (err) {
            return next(err);
        }
    }
    
    
  async generateToken(req, res) {
      let _id = req.params._id;
      const user = await User.findOne({ _id });
      const platform = req.headers['x-hrms-platform'];
      const token = signJWT(user, platform);
      return res.success({
          token
      });
  }

  async logOut(req, res) {
     
      const { user } = req;
      user.authTokenIssuedAt = null;
      user.deviceToken = null;
      await user.save();
      return res.success({}, req.__('LOGOUT_SUCCESS'));
  }

  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  
  async verifyOtp(req, res, next) {
      const {otp, mobile, resetToken } = req.body;
      console.log(req.body);
      try {

          let user = await User.findOne({
            mobile, status: true
          })

          if (!user) {
            return res.status(401).json({msg:"UNAUTHORIZED"});
          } else {
            console.log(user.resetToken,resetToken,user.otp);
              if (user.resetToken == resetToken) {
                  if ((user.otp == otp)) {
                      user.emailVerify = true;
                      let newUser = await user.save();
                      const userJson = newUser.toJSON();
                      const jwttoken = signJWT(user);
                      userJson.jwt = jwttoken;

                      return res.success({user: userJson },'OTP verified');
                  } else {
                    return res.status(401).json({msg:'Invalid OTP'});
                  }

              } else {
                  return res.status(401).json({msg:"Invalid reset token"});
              }
          }
      } catch (err) {
          return next(err)
      }
  }

  async resendOtp(req, res, next) {
      const { mobile, resetToken} = req.body;
      try {
          let user = await User.findOne({mobile, status: true});

          if (!user) { return res.status(401).json({msg:"UNAUTHORIZED"});}
          if (user) {
              if (user.resetToken === resetToken) {
                  let otp = generateOtp();
                  user.otp = otp;
                  await user.save();
                  
                  const options = {
                    url: process.env.FAST_URL,
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        authorization: process.env.FAST_KEY
                    },
                    body: {
                        variables_values: user.otp,
                        route: 'otp',
                        numbers: mobile
                    },
                    json: true
                };

                const result = await sendOTP(options);


                  return res.success({resetToken,mobile}, "OTP sent successfully");

              } else {
                return res.status(401).json({msg:"Invalid reset token"});
              }

          }
      } catch (err) {
          return next(err)
      }
  }

  /**
   * 
   * @param {email,password,deviceToken,deviceType} req 
   * @param {*} res 
   * @param {*} next 
   */
  
  async  signup(req, res, next) {
    const { email, password, name, mobile,lat,lng } = req.body;
    console.log(`signup `,req.body)

    try {
        let user = await User.findOne({ email, mobile });

        if (user) {
            if (!user.isVerified) {
                const otp = generateOtp();
                const hashedPassword = await bcrypt.hash(password, 10);

                user.email = email;
                user.name = name;
                user.password = hashedPassword;
                user.mobile = mobile;
                user.otp = otp;
                user.loc = { coordinates: [lat, lng] };
                user.authTokenIssuedAt = utcDateTime().valueOf();
                const resetToken = randomString(12);
                user.resetToken = resetToken;
                user.isVerified = false;

                await user.save();

                const options = {
                    url: process.env.FAST_URL,
                    method: 'POST',
                    headers: {
                        'content-type': 'application/son',
                        authorization: process.env.FAST_KEY
                    },
                    body: {
                        variables_values: user.otp,
                        route: 'otp',
                        numbers: mobile
                    },
                    json: true
                };

                const result = await sendOTP(options);

                const userJson = user.toJSON();
                ['password', 'authTokenIssuedAt', 'otp', 'resetToken', '__v'].forEach(key => delete userJson[key]);
                return res.success({
                    resetToken,
                    user: userJson,
                }, "Please verify otp to complete registration");
            } else {
                return res.status(500).json({
                    success: false,
                    msg: 'Account already registered'
                });
            }
        } else {
            let newUser = new User();
            const otp = generateOtp();
            const hashedPassword = await bcrypt.hash(password, 10);

            newUser.email = email;
            newUser.mobile = mobile;
            newUser.name = name;
            newUser.password = hashedPassword;
            newUser.otp = otp;
            newUser.loc = { coordinates: [lat, lng] };
            newUser.authTokenIssuedAt = utcDateTime().valueOf();
            const resetToken = randomString(12);
            newUser.resetToken = resetToken;
            newUser.isVerified = false;

            newUser = await newUser.save();

            const options = {
                url: process.env.FAST_URL,
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    authorization: process.env.FAST_KEY
                },
                body: {
                    variables_values: newUser.otp,
                    route: 'otp',
                    numbers: mobile
                },
                json: true
            };

            const result = await sendOTP(options);

            const userJson = newUser.toJSON();
            ['password', 'authTokenIssuedAt', 'otp', 'emailToken', '__v'].forEach(key => delete userJson[key]);
            return res.success({ resetToken, user: userJson }, "Please verify otp to complete registration");
        }
    } catch (err) {
        console.log(err);
        return next(err);
    }
}

  async  forgotPassword(req, res, next) {
    const { mobile } = req.body;
    try {
        const user = await User.findOne({
            mobile,
            status: true
        });

        if (!user) {
            return res.status(401).json({msg:"Not registered"});
        } else if (user) {
            const resetToken = randomString(10);
            const otp = generateOtp();

            user.resetToken = resetToken;
            user.otp = otp;
            user.authTokenIssuedAt = utcDateTime().valueOf();
            await user.save();

            const options = {
                url: process.env.FAST_URL,
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    authorization: process.env.FAST_KEY
                },
                body: {
                    variables_values: user.otp,
                    route: 'otp',
                    numbers: mobile
                },
                json: true
            };

            const result = await sendOTP(options);
            return res.success({ resetToken,mobile }, "OTP sent successfully");
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
            user.password = password;
            await user.save();
            return res.success({}, 'Password reset successfully');
        } else {
            return res.status(401).json({ msg: "Passwords do not match" });
        }
    } catch (err) {
        return next(err);
    }
}

}

module.exports = new AuthController()

function sendOTP(options) {

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        console.error('Error occurred while calling the API:', error.message);
        reject(error);
      } else {
        if (response.statusCode === 503) {
          resolve({ status: false });
        } else {
          resolve( (body) );
        }
      }
    });
  });

}
