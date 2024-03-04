const { signJWT } = require("./utils");
const { generateOtp, randomString, utcDateTime } = require("../lib/util");
const { Airport } = require("../db/models/airport.model");
const cache = require('memory-cache');
var request = require("request");
const bcrypt = require("bcryptjs");
const sendGridMail = require('@sendgrid/mail');
const fromMail = process.env.FROM_MAIL;
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

class airportController {
async search(req,res,next){
  try{
    const { query } = req.query;
    const result = await Airport.find({
      $or: [
        { Airport: { $regex: new RegExp(query, 'i') } },
        { Abbr: { $regex: new RegExp(query, 'i') } },
        { City: { $regex: new RegExp(query, 'i') } },
        { Country: { $regex: new RegExp(query, 'i') } },
      ],
    });
    cache.put(query, result, 60 * 1000);
return res.status(200).send({
  result
})
    // res.json(result);

  }catch(err){
    return next(err)
  }
}
  
}

module.exports = new airportController();


