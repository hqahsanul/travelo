const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    // others fields
    type: { type: String, enum: ['agent', 'user',"admin"],required:true},
    mobile: { type: String,  index:true },
    email: { type: String,  index:true },
    password: { type: String, required: true},
    avatar:{ type: String, default: ''},
    otp:{ type: String, default: '1234'},
    resetToken: { type: String,default: '' },
    emailToken: { type: String,default: '' },
    isVerified: {type: Boolean,default: false}, // progress 1 when true
    loc: {type: { type: String, default: 'Point' },coordinates: [ { type: Number } ] },
    progress : { type: Number, default: 0 },
    deviceType: { type: String,default: '' },
    deviceToken: { type: String,default: '' },
    deviceId: { type: String, default: '' },
    notification: { type: Boolean,default: true },
    Aadhar: { type: String,default: '' },
    pan: { type: String,default: '' },
    GST: { type: String,default: '' },
    address: { type: String,default: '' },
    authTokenIssuedAt: Number,
    isSuspended: { type: Boolean, default: false},
    isDeleted: { type: Boolean, default: false},
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = {User};

