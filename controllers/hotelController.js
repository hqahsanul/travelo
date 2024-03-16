
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
            "NoOfChild": 1,
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
                "CheckInDate": "28-03-2024",
                "NoOfNights":3,
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
         let  data=JSON.parse(body);

          data={
            "Status": 1,
            "Message": "",
            "Search": {

              HotelSearchResult:{

                HotelResults:[

                  {
                    "HotelCode": "1030626-199-YmI2NTE1NDctZTYyOC00OGJiLThiYmEtYTY2ZWQwZDI0NjAx",
                    "OrginalHotelCode": "1030626",
                    "HotelName": "Avari Dubai Hotel",
                    "StarRating": "4",
                    "HotelPicture": "http://www.cfmedia.vfmleonardo.com/imageRepo/3/0/8/259/348/76703_m_P.jpg",
                    "HotelAddress": "162 Abu Baker Al Siddique Rd next to Al Rigga Post Office, Deira Deira",
                    "HotelContactNo": [
                        {
                            "type": "Voice",
                            "number": "97-142-956666"
                        },
                        {
                            "type": "Fax",
                            "number": "971-4-295 96 59"
                        }
                    ],
                    "Latitude": "25.26035",
                    "Longitude": "55.326695",
                    "HotelCategory": "Hotel",
                    "trip_adv_url": "http://www.tripadvisor.com/Hotel_Review-g295424-d299721-Reviews-Avari_Dubai_Hotel-Dubai_Emirate_of_Dubai.html?m=19454",
                    "trip_rating": "4.0",
                    "HotelAmenities": [
                        "restaurant",
                        "breakfast",
                        "fitness",
                        "fitness",
                        "pool",
                        "pool",
                        "pool",
                        "pool",
                        "pool",
                        "pool",
                        "parking",
                        "parking",
                        "parking",
                        "wifi"
                    ],
                    "HotelLocation": "Dubai",
                    "Price": {
                        "TBO_RoomPrice": 5211.19,
                        "TBO_OfferedPriceRoundedOff": 5424,
                        "TBO_PublishedPrice": 5530.44,
                        "TBO_PublishedPriceRoundedOff": 5530,
                        "Tax": 0,
                        "ExtraGuestCharge": 0,
                        "ChildCharge": 0,
                        "OtherCharges": 212.83,
                        "Discount": 0,
                        "PublishedPrice": 2712,
                        "RoomPrice": 2712,
                        "PublishedPriceRoundedOff": 2712,
                        "OfferedPrice": 2712.01,
                        "OfferedPriceRoundedOff": 2712,
                        "AgentCommission": 106.42,
                        "AgentMarkUp": 0,
                        "ServiceTax": 38.31,
                        "TDS": 0,
                        "ServiceCharge": 0,
                        "TotalGSTAmount": 38.3097,
                        "RoomPriceWoGST": 2712,
                        "GSTPrice": 0,
                        "CurrencyCode": "INR"
                    },
                    "HotelPromotion": "",
                    "HotelPromotionContent": "",
                    "ResultToken": "d9deec0968a561131e06fd3e73348af5*_*1*_*3pYbsrFUOESw65IZ"
                },
                {
                    "HotelCode": "1017415-200-YmI2NTE1NDctZTYyOC00OGJiLThiYmEtYTY2ZWQwZDI0NjAx",
                    "OrginalHotelCode": "1017415",
                    "HotelName": "Sun and Sky Al Rigga Hotel",
                    "StarRating": "4",
                    "HotelPicture": "https://www.cfmedia.vfmleonardo.com/imageRepo/6/0/82/819/698/36175740_(1)_P.jpg",
                    "HotelAddress": "Al Rigga Road 35Th St Opposite Al Ghurair Shopping Mall Al MuraqqabatDeiraDubai",
                    "HotelContactNo": [
                        {
                            "type": "Voice",
                            "number": "971-4-2278888"
                        },
                        {
                            "type": "Fax",
                            "number": "971-4-2280840"
                        }
                    ],
                    "Latitude": "25.265466",
                    "Longitude": "55.319332",
                    "HotelCategory": "Hotel",
                    "trip_adv_url": "http://www.tripadvisor.com/Hotel_Review-g295424-d497308-Reviews-Sun_Sky_Al_Rigga_Hotel-Dubai_Emirate_of_Dubai.html?m=19454",
                    "trip_rating": "3.0",
                    "HotelAmenities": [
                        "breakfast",
                        "fitness",
                        "pool",
                        "pool",
                        "parking",
                        "parking",
                        "wifi"
                    ],
                    "HotelLocation": "Dubai",
                    "Price": {
                        "TBO_RoomPrice": 5496.29,
                        "TBO_OfferedPriceRoundedOff": 5720,
                        "TBO_PublishedPrice": 5832.22,
                        "TBO_PublishedPriceRoundedOff": 5832,
                        "Tax": 0,
                        "ExtraGuestCharge": 0,
                        "ChildCharge": 0,
                        "OtherCharges": 223.95,
                        "Discount": 0,
                        "PublishedPrice": 2860,
                        "RoomPrice": 2860,
                        "PublishedPriceRoundedOff": 2860,
                        "OfferedPrice": 2860.12,
                        "OfferedPriceRoundedOff": 2860,
                        "AgentCommission": 111.97,
                        "AgentMarkUp": 0,
                        "ServiceTax": 40.31,
                        "TDS": 0,
                        "ServiceCharge": 0,
                        "TotalGSTAmount": 40.3109,
                        "RoomPriceWoGST": 2860,
                        "GSTPrice": 0,
                        "CurrencyCode": "INR"
                    },
                    "HotelPromotion": "",
                    "HotelPromotionContent": "",
                    "ResultToken": "d9deec0968a561131e06fd3e73348af5*_*2*_*FYBf9B7uvjNnWW6i"
                },
                {
                    "HotelCode": "1377188-201-YmI2NTE1NDctZTYyOC00OGJiLThiYmEtYTY2ZWQwZDI0NjAx",
                    "OrginalHotelCode": "1377188",
                    "HotelName": "Hafez Hotel Apartment",
                    "StarRating": "3",
                    "HotelPicture": "https://i.travelapi.com/lodging/11000000/10260000/10257700/10257665/49b39a9d_z.jpg",
                    "HotelAddress": "Next To E Nbd Bank Bldg Al Ras Opp. Metro & Fire Station, Deira Near AL Ras Metro StationDeiraP.O Box 83163",
                    "HotelContactNo": [
                        {
                            "type": "Voice",
                            "number": "971-42-353222"
                        },
                        {
                            "type": "Fax",
                            "number": "971-04-2353007"
                        }
                    ],
                    "Latitude": "25.267571",
                    "Longitude": "55.293832",
                    "HotelCategory": "Hotel",
                    "trip_adv_url": "http://www.tripadvisor.com/Hotel_Review-g295424-d3825325-Reviews-OYO_151_Hafez_Hotel_Apartments-Dubai_Emirate_of_Dubai.html?m=19454",
                    "trip_rating": "2.0",
                    "HotelAmenities": [
                        "wifi"
                    ],
                    "HotelLocation": "Dubai",
                    "Price": {
                        "TBO_RoomPrice": 5667.83,
                        "TBO_OfferedPriceRoundedOff": 5899,
                        "TBO_PublishedPrice": 6014.87,
                        "TBO_PublishedPriceRoundedOff": 6015,
                        "Tax": 0,
                        "ExtraGuestCharge": 0,
                        "ChildCharge": 0,
                        "OtherCharges": 231.1,
                        "Discount": 0,
                        "PublishedPrice": 2949.5,
                        "RoomPrice": 2950,
                        "PublishedPriceRoundedOff": 2950,
                        "OfferedPrice": 2949.46,
                        "OfferedPriceRoundedOff": 2950,
                        "AgentCommission": 115.95,
                        "AgentMarkUp": 0,
                        "ServiceTax": 41.6,
                        "TDS": 0,
                        "ServiceCharge": 0,
                        "TotalGSTAmount": 41.5974,
                        "RoomPriceWoGST": 2950,
                        "GSTPrice": 0,
                        "CurrencyCode": "INR"
                    },
                    "HotelPromotion": "",
                    "HotelPromotionContent": "",
                    "ResultToken": "d9deec0968a561131e06fd3e73348af5*_*3*_*mcpfjeF8rIKyxTXH"
                },
                {
                    "HotelCode": "1508526-43-YmI2NTE1NDctZTYyOC00OGJiLThiYmEtYTY2ZWQwZDI0NjAx",
                    "OrginalHotelCode": "1508526",
                    "HotelName": "Al Farej Hotel",
                    "StarRating": "3",
                    "HotelPicture": "https://i.travelapi.com/lodging/17000000/16310000/16302200/16302167/8e05e07a_z.jpg",
                    "HotelAddress": "Fareej Al Murarr Opposite Delhi Restaurant Near Al Futtaim Mosque Deira Near Al Futtaim MosqueDeiraDubai",
                    "HotelContactNo": [
                        {
                            "type": "Voice",
                            "number": "971-4-2900600"
                        },
                        {
                            "type": "Fax",
                            "number": "971-4-2900666"
                        }
                    ],
                    "Latitude": "25.276139",
                    "Longitude": "55.310575",
                    "HotelCategory": "Hotel",
                    "trip_adv_url": "",
                    "trip_rating": "0.0",
                    "HotelAmenities": [
                        "breakfast",
                        "parking",
                        "wifi",
                        "wifi"
                    ],
                    "HotelLocation": "Dubai",
                    "Price": {
                        "TBO_RoomPrice": 5700.95,
                        "TBO_OfferedPriceRoundedOff": 5941,
                        "TBO_PublishedPrice": 6241.04,
                        "TBO_PublishedPriceRoundedOff": 6241,
                        "Tax": 0,
                        "ExtraGuestCharge": 0,
                        "ChildCharge": 0,
                        "OtherCharges": 240.04,
                        "Discount": 0,
                        "PublishedPrice": 2970.5,
                        "RoomPrice": 2971,
                        "PublishedPriceRoundedOff": 2971,
                        "OfferedPrice": 2970.495,
                        "OfferedPriceRoundedOff": 2971,
                        "AgentCommission": 300.05,
                        "AgentMarkUp": 0,
                        "ServiceTax": 43.21,
                        "TDS": 0,
                        "ServiceCharge": 0,
                        "TotalGSTAmount": 43.2072,
                        "RoomPriceWoGST": 2971,
                        "GSTPrice": 0,
                        "CurrencyCode": "INR"
                    },
                    "HotelPromotion": "",
                    "HotelPromotionContent": "",
                    "ResultToken": "d9deec0968a561131e06fd3e73348af5*_*4*_*jyVM3wyaLbeDYCs7"
                },
                {
                    "HotelCode": "1134719-90-YmI2NTE1NDctZTYyOC00OGJiLThiYmEtYTY2ZWQwZDI0NjAx",
                    "OrginalHotelCode": "1134719",
                    "HotelName": "St. George Hotel",
                    "StarRating": "3",
                    "HotelPicture": "http://www.cfmedia.vfmleonardo.com/imageRepo/1/0/12/901/619/H67JLL08_P.jpg",
                    "HotelAddress": "Alras Deira P.O.Box 3944 Deira Dubai Dubai CreekDubaiAl Ras",
                    "HotelContactNo": [
                        {
                            "type": "Voice",
                            "number": "971-800-0178152"
                        },
                        {
                            "type": "Fax",
                            "number": "971-800-0178152"
                        }
                    ],
                    "Latitude": "25.266439",
                    "Longitude": "55.294139",
                    "HotelCategory": "Hotel",
                    "trip_adv_url": "http://www.tripadvisor.com/Hotel_Review-g295424-d308235-Reviews-OYO_117_St_George_Hotel-Dubai_Emirate_of_Dubai.html?m=19454",
                    "trip_rating": "3.5",
                    "HotelAmenities": [
                        "breakfast",
                        "parking",
                        "parking",
                        "wifi"
                    ],
                    "HotelLocation": "Dubai",
                    "Price": {
                        "TBO_RoomPrice": 5799.05,
                        "TBO_OfferedPriceRoundedOff": 6043,
                        "TBO_PublishedPrice": 6348.43,
                        "TBO_PublishedPriceRoundedOff": 6348,
                        "Tax": 0,
                        "ExtraGuestCharge": 0,
                        "ChildCharge": 0,
                        "OtherCharges": 244.17,
                        "Discount": 0,
                        "PublishedPrice": 3021.5,
                        "RoomPrice": 3022,
                        "PublishedPriceRoundedOff": 3022,
                        "OfferedPrice": 3021.61,
                        "OfferedPriceRoundedOff": 3022,
                        "AgentCommission": 305.21,
                        "AgentMarkUp": 0,
                        "ServiceTax": 43.95,
                        "TDS": 0,
                        "ServiceCharge": 0,
                        "TotalGSTAmount": 43.9506,
                        "RoomPriceWoGST": 3022,
                        "GSTPrice": 0,
                        "CurrencyCode": "INR"
                    },
                    "HotelPromotion": "",
                    "HotelPromotionContent": "",
                    "ResultToken": "d9deec0968a561131e06fd3e73348af5*_*5*_*GSOWZdugwX8pfEzC"
                }


                ]



              }
            }
          }




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










