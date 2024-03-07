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
  async search(req, res, next) {
    try {
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
      return res.status(200).send({ result });

    } catch (err) {
      return next(err)
    }
  }

  async searchFlight(req, res, next) {
    const { AdultCount, ChildCount, InfantCount, JourneyType, PreferredAirlines, CabinClass, Segments } = req.body;
  
    const options = {
      method: 'POST',
      url: 'http://test.services.travelomatix.com/webservices/index.php/flight/service/Search',
      headers: {
        'x-Username': process.env.X_USERNAME,
        'x-DomainKey': process.env.X_DOMAIN_KEY,
        'x-Password': process.env.X_PASSWORD,
        'x-system': process.env.X_SYSTEM,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        AdultCount,
        ChildCount,
        InfantCount,
        JourneyType,
        PreferredAirlines,
        CabinClass,
        Segments,
      }),
    };
  
    request(options, (error, response, body) => {
      if (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
     const data=JSON.parse(body);
      return res.status(200).send({ data });
    });
 
 }
}

module.exports = new airportController();


