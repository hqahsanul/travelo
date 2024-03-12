
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HotelCitySchema = new Schema({
    city_code: {type:String,index:true},
    city_name: {type:String,index:true},
    country_name: {type:String,index:true},
    country_code: {type:String,index:true},
    status: {type:Number,defaul:0,index:true}, // 0=active,1=suspended, 2=deleted
    isDeleted: { type: Boolean, default: false},
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now }
  });

 const HotelCity = mongoose.model('HotelCity', HotelCitySchema);
 module.exports = {HotelCity};
  

 