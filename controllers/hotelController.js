
const cache = require('memory-cache');
var request = require("request");
const { HotelCity } = require("../db/models/hotel.model");
const { Travelo_HOST,X_USERNAME,X_DOMAIN_KEY,X_PASSWORD,X_SYSTEM}=process.env;

class hotelController {

    // async SaveCity(req, res, next) {
    //     try {
    //         var options = {
    //             'method': 'GET',
    //             'url': 'http://test.services.travelomatix.com/webservices/index.php/hotel_v3/service/HotelCityList',
    //             'headers': {
    //               'x-Username': 'test315334',
    //               'x-DomainKey': 'TMX4633151705930042',
    //               'x-Password': 'test@315',
    //               'x-system': 'test'
    //             }
    //           };
    //           request(options, async function (error, response) {
    //             if (error) throw new Error(error);
    //             console.log(typeof response.body);
    //             const result = JSON.parse(response.body);
    //             let cities=result?.HotelCityList?result.HotelCityList:[];
    //             const _=await HotelCity.insertMany(cities)
    //             return res.status(200).send({ _ });
    //           });
              
    
    //     } catch (err) {
    //       return next(err)
    //     }
    //   }

    async search(req, res, next) {
        try {
            const { query } = req.query;
            const result = await HotelCity.find({
                $or: [
                    { city_name: { $regex: new RegExp(query, 'i') } },
                    { country_name: { $regex: new RegExp(query, 'i') } },
                    { country_code: { $regex: new RegExp(query, 'i') } }
                ],
            }).limit(20);
            return res.status(200).send({ result });

        } catch (err) {
            return next(err)
        }
    }
    async searchHotel(req, res, next) {
        const { RoomGuests, CheckInDate, NoOfNights, CountryCode, CityId,GuestNationality,NoOfRooms } = req.query;
      const _RoomGuests=[
        {
            "NoOfAdults": 1,
            "NoOfChild": 2,
            "ChildAge": [
                "4",
                "6"
            ]
        },
        {
            "NoOfAdults": 1,
            "NoOfChild": 0
        }
      ]
        const options = {
          method: 'POST',
          url: `${Travelo_HOST}/hotel_v3/service/Search`,
          headers: {
            'x-Username': process.env.X_USERNAME,
            'x-DomainKey': process.env.X_DOMAIN_KEY,
            'x-Password': process.env.X_PASSWORD,
            'x-system': process.env.X_SYSTEM,
            'Content-Type': 'application/json',
          },
            body: JSON.stringify({
                "CheckInDate": CheckInDate,
                "NoOfNights": NoOfNights,
                "CountryCode": CountryCode,
                "CityId": CityId,
                "GuestNationality": GuestNationality,
                "NoOfRooms": NoOfRooms,
                "RoomGuests": _RoomGuests
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

module.exports = new hotelController();











