const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const airportSchema = new Schema({
    sl_no: {type:Number,index:true},
    Airport: {type:String,index:true},
    Abbr: {type:String,index:true},
    City: {type:String,index:true},
    Country: {type:String,index:true},
    isSuspended: { type: Boolean, default: false},
    isDeleted: { type: Boolean, default: false},
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now }
  });

 const Airport = mongoose.model('airport', airportSchema);
 module.exports = {Airport};

