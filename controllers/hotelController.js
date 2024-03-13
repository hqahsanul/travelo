
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
                "CheckInDate": "27-03-2024",
                "NoOfNights": 1,
                "CountryCode": "IN",
                "CityId": 5100,
                "GuestNationality": "IN",
                "NoOfRooms": 2,
                "RoomGuests": _RoomGuests
            }),
        };

        // body: JSON.stringify({
        //     "CheckInDate": CheckInDate,
        //     "NoOfNights": NoOfNights,
        //     "CountryCode": CountryCode,
        //     "CityId": CityId,
        //     "GuestNationality": GuestNationality,
        //     "NoOfRooms": NoOfRooms,
        //     "RoomGuests": _RoomGuests
        // }),
      
        request(options, (error, response, body) => {
          if (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
          }
         const data=JSON.parse(body);
          return res.status(200).send({ data });
        });
     
     }

     async hotelInfo(req, res, next) {
        const { ResultToken } = req.query;
      
        const options = {
            method: 'POST',
            url: `${Travelo_HOST}/hotel_v3/service/HotelDetails`,
            headers: {
              'x-Username': process.env.X_USERNAME,
              'x-DomainKey': process.env.X_DOMAIN_KEY,
              'x-Password': process.env.X_PASSWORD,
              'x-system': process.env.X_SYSTEM,
              //'Content-Type': 'application/json',
              "ResultToken": "c70610dcdec4acc2faf14c0a2ebe23c8*_*1*_*cykc7MSkIPvFrHw1"
            },
            body: JSON.stringify({
                "ResultToken": "c70610dcdec4acc2faf14c0a2ebe23c8*_*1*_*cykc7MSkIPvFrHw1"
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
     async roomInfo(req, res, next) {
        const { ResultToken } = req.query;

        const options = {
            method: 'POST',
            url: `${Travelo_HOST}/hotel_v3/service/RoomList`,
            headers: {
              'x-Username': process.env.X_USERNAME,
              'x-DomainKey': process.env.X_DOMAIN_KEY,
              'x-Password': process.env.X_PASSWORD,
              'x-system': process.env.X_SYSTEM,
              //'Content-Type': 'application/json',
              "ResultToken": "c70610dcdec4acc2faf14c0a2ebe23c8*_*1*_*cykc7MSkIPvFrHw1"
            },
            body: JSON.stringify({
                "ResultToken": "c70610dcdec4acc2faf14c0a2ebe23c8*_*1*_*cykc7MSkIPvFrHw1"
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

     async roomBlock(req, res, next) {
        const { ResultToken,RoomUniqueId } = req.query;

        const options = {
            method: 'GET',
            url: `${Travelo_HOST}/hotel_v3/service/RoomList`,
            headers: {
              'x-Username': process.env.X_USERNAME,
              'x-DomainKey': process.env.X_DOMAIN_KEY,
              'x-Password': process.env.X_PASSWORD,
              'x-system': process.env.X_SYSTEM,
              'Content-Type': 'application/json',
             },
             body: JSON.stringify({
                 "ResultToken": "598b913d10565e2c0a2df528157b039e*_*3*_*r0vluiA37WWLmyFL",
                 "RoomUniqueId": [
                     "598b913d10565e2c0a2df528157b039e*_*9*_*w34qKF4XJAvQG0UF"
                 ]
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

    async Book(req, res, next) {
        const { ResultToken,BlockRoomId,AppReference,RoomDetails } = req.body;

        const options = {
            method: 'POST',
            url: `${Travelo_HOST}/hotel_v3/service/CommitBooking`,
            headers: {
                'x-Username': process.env.X_USERNAME,
                'x-DomainKey': process.env.X_DOMAIN_KEY,
                'x-Password': process.env.X_PASSWORD,
                'x-system': process.env.X_SYSTEM,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "ResultToken": "560b1806eab47a57561e442bad5770f3*_*3*_*XJlPOG6edEEFfxSJ",
                "BlockRoomId": "560b1806eab47a57561e442bad5770f3*_*6*_*FJJ6d35DN1VgkEwt",
                "AppReference": "HB10-125738-495363",
                "RoomDetails": [
                    {
                        "PassengerDetails": [
                            {
                                "Title": "Ms",
                                "FirstName": "Anitha",
                                "MiddleName": "",
                                "LastName": "gangapatnam",
                                "Phoneno": "9000983418",
                                "Email": "anitha.g.provab@gmail.com",
                                "PaxType": "1",
                                "LeadPassenger": true,
                                "Age": 30
                            },
                            {
                                "Title": "Mr",
                                "FirstName": "Anil",
                                "MiddleName": "",
                                "LastName": "gangapatnam",



                                "Phoneno": "9000983418",
                                "Email": "anitha.g.provab@gmail.com",
                                "PaxType": "1",
                                "LeadPassenger": false,
                                "Age": 30
                            },
                            {
                                "Title": "Mstr",
                                "FirstName": "sai",
                                "MiddleName": "",
                                "LastName": "gangapatanm",
                                "Phoneno": "9000983418",
                                "Email": "anitha.g.provab@gmail.com",
                                "PaxType": "2",
                                "LeadPassenger": false,
                                "Age": 5
                            },
                            {
                                "Title": "Mstr",
                                "FirstName": "harisai",
                                "MiddleName": "",
                                "LastName": "gangapatanm",
                                "Phoneno": "9000983418",
                                "Email": "anitha.g.provab@gmail.com",
                                "PaxType": "2",
                                "LeadPassenger": false,
                                "Age": 7
                            }
                        ]
                    },
                    {
                        "PassengerDetails": [
                            {
                                "Title": "Ms",
                                "FirstName": "Haritha",
                                "MiddleName": "",
                                "LastName": "gangapatnam",
                                "Phoneno": "9000983418",
                                "Email": "anitha.g.provab@gmail.com",
                                "PaxType": "1",
                                "LeadPassenger": true,
                                "Age": 30
                            }
                        ]
                    }
                ]
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
     
     async BookingDetails(req, res, next) {
        const { AppReference } = req.body;

        const options = {
            method: 'POST',
            url: `${Travelo_HOST}/hotel_v3/service/CommitBooking`,
            headers: {
                'x-Username': process.env.X_USERNAME,
                'x-DomainKey': process.env.X_DOMAIN_KEY,
                'x-Password': process.env.X_PASSWORD,
                'x-system': process.env.X_SYSTEM,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    AppReference: "HB-22052018-4564654"
                }
            ),
        };


        request(options, (error, response, body) => {
          if (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
          }
         const data=JSON.parse(body);
          return res.status(200).send({ data });
        });
     
     }

     async cancelBooking(req, res, next) {
        const { AppReference } = req.body;

        const options = {
            method: 'POST',
            url: `${Travelo_HOST}/hotel_v3/service/CancelBooking`,
            headers: {
                'x-Username': process.env.X_USERNAME,
                'x-DomainKey': process.env.X_DOMAIN_KEY,
                'x-Password': process.env.X_PASSWORD,
                'x-system': process.env.X_SYSTEM,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    AppReference: "HB-22052018-4564654"
                }
            ),
        };


        request(options, (error, response, body) => {
          if (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
          }
         const data=JSON.parse(body);
          return res.status(200).send({ data });
        });
     
     }

     async canceledRefundDetails(req, res, next) {

        const options = {
            method: 'POST',
            url: `${Travelo_HOST}/hotel_v3/service/CancellationRefundDetails`,
            headers: {
                'x-Username': process.env.X_USERNAME,
                'x-DomainKey': process.env.X_DOMAIN_KEY,
                'x-Password': process.env.X_PASSWORD,
                'x-system': process.env.X_SYSTEM,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    "ChangeRequestId": "2",
                    "AppReference": "HB10-130820-197161"
                }
            ),
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










