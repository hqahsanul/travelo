const { Airport } = require("../db/models/airport.model");
const cache = require('memory-cache');
var request = require("request");
const { Travelo_HOST,X_USERNAME,X_DOMAIN_KEY,X_PASSWORD,X_SYSTEM}=process.env;


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
      }).limit(20);
   //   cache.put(query, result, 60 * 1000);
      return res.status(200).send({ result });

    } catch (err) {
      return next(err)
    }
  }

  async searchFlight(req, res, next) {
    const { AdultCount, ChildCount, InfantCount, JourneyType, PreferredAirlines, CabinClass, Segments } = req.query;
  
    const options = {
      method: 'POST',
      url: `${Travelo_HOST}/flight/service/Search`,
      headers: {
        'x-Username': X_USERNAME,
        'x-DomainKey': X_DOMAIN_KEY,
        'x-Password': X_PASSWORD,
        'x-system': X_SYSTEM,
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


