
const cache = require('memory-cache');
var request = require("request");
const { HotelCity } = require("../db/models/hotel.model");


class hotelController {

    async SaveCity(req, res, next) {
        try {
            var options = {
                'method': 'GET',
                'url': 'http://test.services.travelomatix.com/webservices/index.php/hotel_v3/service/HotelCityList',
                'headers': {
                  'x-Username': 'test315334',
                  'x-DomainKey': 'TMX4633151705930042',
                  'x-Password': 'test@315',
                  'x-system': 'test'
                }
              };
              request(options, async function (error, response) {
                if (error) throw new Error(error);
                console.log(typeof response.body);
                const result = JSON.parse(response.body);
                let cities=result?.HotelCityList?result.HotelCityList:[];
                const _=await HotelCity.insertMany(cities)
                return res.status(200).send({ _ });
              });
              
    
        } catch (err) {
          return next(err)
        }
      }
}

module.exports = new hotelController();









