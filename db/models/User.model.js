const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({

    // others fields
    profileFor: { type: String, enum: ['Bride', 'Groom']},
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
    authTokenIssuedAt: Number,
    isSuspended: { type: Boolean, default: false},
    isDeleted: { type: Boolean, default: false},
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now }
});

const profileSchema = new Schema({
    
    userId: { type: Schema.Types.ObjectId, ref: 'users' },

    // Account Information (for progress 2)
    creatingProfileFor: { type: String, enum: ['MySelf', 'Son', 'Daughter', 'Friends', 'Relative'], default: 'MySelf' },
    martialStatus: { type: String, enum: ['Single', 'Divorced'], default: 'Single' },
    kundliMatch: { type: Boolean, default: false },
    bioDataImage: { type: String, default:'' },

    // Personal Information 1st (for progress 3)
    fullName: { type: String, default: '' },
    gotra: { type: String, default: '', index: true },
    dob: { type: String, default: '' },
    // birthPlace: { type: String, default: '' },
    birthTime: { type: String, default: '' },
    
    gender: { type: String, default: '', index:true },
    city: { type: String, default: '', index: true },
    state: { type: String, default: '', index: true },
    age: { type: Number, index: true },

    // Personal Information 2nd (for progress 4)
    currentLocation: { type: String, default: '' },
    willingRelocate: { type: Boolean, default: false },
    liveWithFamily: { type: Boolean, default: true },

    // Personal Information 3rd (for progress 6)
    heigth: { type: String },
    weigth: { type: String },
    bodyType: { type: String, enum:['Slim', 'Average', 'Athlete', 'Heavy'], default: 'Athlete' },
    complexion: { type: String, enum:['Fair','Medium', 'Dark', 'Wheatish'] },

    // Personal Information 4th (for progress 7)
    diet: { type: String, enum: ['Veg', 'Non-Veg', 'Jain Food', 'Egeitarion'], default: 'Veg' },
    drink: { type: String, enum: ['Do not Drink', 'Occasionally', 'Regularly Drink'], default: 'Do not Drink' },
    smoke: { type: String, enum: ['Do not Smoke', 'Occasionally', 'Regularly Smoke'], default: 'Do not Smoke' },
    havingPet: { type: Boolean, default: false },

    // (for progress 11)
    expressYourself: { type: String, default: '' },
    image: { type: String, default:'' },

})

// (for progress 5)
const educationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users'},
    highestQualification: { type: String },
    collegeName: { type: String },
    workWith: { type: String },
})

// (for progress 8)
const familySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users'},
    fatherName: { type: String },
    fathersJob: { type: String },
    motherName: { type: String },
    mothersJob: { type: String },
    brothers: { type: Number },
    sisters: { type: Number },
    brothersName: [{ type: String }],
    brothersJob: { type: String },
    sistersName: [{ type: String }],
    sistersJob: { type: String },
    marriedBrothers: { type: Number },
    unMarriedBrothers: { type: Number },
    marriedSisters: { type: Number },
    unMarriedSisters: { type: Number },
})

// (for progress 9)
const socialInfoSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users'},
    facebookLink: { type: String },
    fbAccessibility: { type: String, enum: ['Public', 'Private'], default: 'Private' },
    instagramLink: { type: String },
    instaAccessibility: { type: String, enum: ['Public', 'Private'], default: 'Private' },
    linkedinLink: { type: String },
    linkedinAccessibility: { type: String, enum: ['Public', 'Private'], default: 'Private' },
    whatsappNumber: { type: String },
    whatsappAccessibility: { type: String, enum: ['Public', 'Private'], default: 'Private' },
})

// (for progress 10)
const partnerPreferenceSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    gender: { type: String },
    excludedGotra : [{ type: String }],
    age: { type: Number },
    city: { type: String },
    state: { type: String },
    martialStatus: { type: String },
    heigth: { type: String },
    annualIncome: { type: Number },
    
})

const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Education = mongoose.model('Education', educationSchema);
const Family = mongoose.model('Family', familySchema);
const SocialInfo = mongoose.model('SocialInfo', socialInfoSchema);
const PartnerPreference = mongoose.model('PartnerPreference', partnerPreferenceSchema);

module.exports = { User, Profile, Education, Family, SocialInfo, PartnerPreference };

