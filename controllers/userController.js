const { User, Profile, Education, Family, SocialInfo, PartnerPreference } = require("../db/models/User.model");
const { uploadImageAPI } = require("../lib/util");
const multiparty = require("multiparty");
const _ = require("lodash");
const moment = require("moment");
const mongoose = require("mongoose");
const cron = require('node-cron');


class UserController {

  async createProfile(req, res, next) {
    try {
      const user = await User.findOne({ _id: req._id });

      if (!user) {
        return res
          .status(404)
          .send({ success: false, data: {}, message: "User not found" });
      }

      const form = new multiparty.Form();
      const { fields, files } = await parseFormAsync(form, req);

      const profileData = {};
      for (const key in fields) {
        if (fields.hasOwnProperty(key)) {
          profileData[key] = fields[key][0];
          profileData["userId"] = req._id;
        }
      }

      if (files.bioDataImage && files.bioDataImage[0].originalFilename) {
        const fileupload = files.bioDataImage[0];
        const image = await uploadImageAPI(fileupload, "profileBio");
        profileData.bioDataImage = image.key;
      }

      if (files.image && files.image[0].originalFilename) {
        const fileupload = files.image[0];
        const image = await uploadImageAPI(fileupload, "profileImage");
        profileData.image = image.key;
      }

      profileData.progress = Number(profileData.progress);

      const profileProgressValues = [2, 3, 4, 6, 7, 11];
      if (profileProgressValues.includes(profileData.progress)) {
        if (profileData.dob) {
          let age = calculateAge(profileData.dob);
          profileData.age = age;
        }
        await Profile.updateOne(
          { userId: req._id },
          { $set: profileData },
          { upsert: true, new: true }
        );
      }

      if (profileData.progress == 5) {
        await Education.updateOne(
          { userId: req._id },
          { $set: profileData },
          { upsert: true, new: true }
        );
      }

      if (profileData.progress == 8) {
        profileData.brothersName = profileData.brothersName.split(",");
        profileData.sistersName = profileData.sistersName.split(",");
        await Family.updateOne(
          { userId: req._id },
          { $set: profileData },
          { upsert: true, new: true }
        );
      }

      if (profileData.progress == 9) {
        await SocialInfo.updateOne(
          { userId: req._id },
          { $set: profileData },
          { upsert: true, new: true }
        );
      }

      if (profileData.progress == 10) {
        profileData.excludedGotra = profileData.excludedGotra.split(",");
        await PartnerPreference.updateOne(
          { userId: req._id },
          { $set: profileData },
          { upsert: true, new: true }
        );
      }

      await User.findOneAndUpdate(
        { _id: req._id },
        { progress: profileData.progress }
      );

      return res.status(200).json({ success: true, message: "Profile updated successfully", data: { progress: profileData.progress } });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async  getFields(req, res, next) {
    try {
      const user = await User.findOne({ _id: req._id });
  
      if (!user) {
        return res.status(404).json({ success: false, data: {}, message: "User not found" });
      }
  
      const progress = user.progress;
      const fields = {};
  
      let schemaData;
  
      switch (progress) {
        case 2:
          schemaData = await Profile.findOne({ userId: req.user._id }, { __v: 0, _id: 0 });
          fields.creatingProfileFor = schemaData.creatingProfileFor;
          fields.martialStatus = schemaData.martialStatus;
          fields.kundliMatch = schemaData.kundliMatch;
          fields.bioDataImage = schemaData.bioDataImage;
          break;
        case 3:
          schemaData = await Profile.findOne({ userId: req.user._id }, { __v: 0, _id: 0 });
          fields.fullName = schemaData.fullName;
          fields.gotra = schemaData.gotra;
          fields.dob = schemaData.dob;
          fields.birthTime = schemaData.birthTime;
          fields.gender = schemaData.gender;
          fields.city = schemaData.city;
          fields.state = schemaData.state;
          fields.age = schemaData.age;
          break;
        case 4:
          schemaData = await Profile.findOne({ userId: req.user._id }, { __v: 0, _id: 0 });
          fields.currentLocation = schemaData.currentLocation;
          fields.willingRelocate = schemaData.willingRelocate;
          fields.liveWithFamily = schemaData.liveWithFamily;
          break;
        case 5:
          schemaData = await Education.findOne({ userId: req._id }, { __v: 0, _id: 0 });
          fields.highestQualification = schemaData.highestQualification;
          fields.collegeName = schemaData.collegeName;
          fields.workWith = schemaData.workWith;
          break;
        case 6:
          schemaData = await Profile.findOne({ userId: req.user._id }, { __v: 0, _id: 0 });
          fields.heigth = schemaData.heigth;
          fields.weigth = schemaData.weigth;
          fields.bodyType = schemaData.bodyType;
          fields.complexion = schemaData.complexion;
          break;
        case 7:
          schemaData = await Profile.findOne({ userId: req.user._id }, { __v: 0, _id: 0 });
          fields.diet = schemaData.diet;
          fields.drink = schemaData.drink;
          fields.smoke = schemaData.smoke;
          fields.havingPet = schemaData.havingPet;
          break;
        case 8:
          schemaData = await Family.findOne({ userId: req._id }, { __v: 0, _id: 0 });
          Object.assign(fields, schemaData._doc);
          break;
        case 9:
          schemaData = await SocialInfo.findOne({ userId: req._id }, { __v: 0, _id: 0 });
          Object.assign(fields, schemaData._doc);
          break;
        case 10:
          schemaData = await PartnerPreference.findOne({ userId: req._id }, { __v: 0, _id: 0 });
          Object.assign(fields, schemaData._doc);
          break;
        case 11:
          schemaData = await Profile.findOne({ userId: req.user._id }, { __v: 0, _id: 0 });
          fields.expressYourself = schemaData.expressYourself;
          break;
        default:
          return res.status(400).json({ success: false, data: {}, message: "Invalid progress value" });
      }
  
      res.status(200).json({ success: true, progress, data: { fields }, message: "Profile fields" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  
  async matchProfiles(req, res, next) {
    try {
      let user = await User.findOne({ _id: req._id });

      if (!user) {
        return res.status(404).send({ success: false, data: {}, message: "User not found" });
      }

      const { gender, excludedGotra, ageRange, state } = req.body;
      const defaultPreference = await PartnerPreference.findOne({ userId: req._id });

      let matchCriteria = {
        userId: { $ne : req._id } 
      }

      if (gender) {
        matchCriteria.gender = gender;
      }
  
      if (excludedGotra && excludedGotra.length > 0) {
        matchCriteria.excludedGotra = excludedGotra;
      }
  
      if (state) {
        matchCriteria.state = state;
      }

      if (ageRange && ageRange.length > 0) {
        const [minAge, maxAge] = ageRange;
        if (!isNaN(minAge) && !isNaN(maxAge)) {
          matchCriteria.age = { $gte: minAge, $lte: maxAge };
        }
      }

      if(!gender && excludedGotra.length <= 0 && !state && ageRange.length <= 0){
        matchCriteria.gender = defaultPreference.gender,
        matchCriteria.excludedGotra = { $ne: defaultPreference.excludedGotra },
        matchCriteria.age = defaultPreference.age
        matchCriteria.city = defaultPreference.city
        matchCriteria.state = defaultPreference.state
      }

      console.log(matchCriteria, "+++++++++++++++++++++++++++++++++++++++++++++++++++++++++matchCriteria")

      // let matchCriteria = {
      //   userId: { $ne: req._id },
      //   gender: gender || defaultPreference.gender,
      //   excludedGotra: { $ne: excludedGotra || defaultPreference.excludedGotra},
      //   state: state || defaultPreference.state,
      // };

      // if (ageRange) {
      //   const [minAge, maxAge] = ageRange;
      //   if (!isNaN(minAge) && !isNaN(maxAge)) {
      //     matchCriteria.age = { $gte: minAge, $lte: maxAge };
      //   }
      // } 
      // else {
      //   matchCriteria.age = defaultPreference.age;
      // }

      const matches = await Profile.aggregate([
        { 
          $match: matchCriteria 
        },
        {
          $lookup: {
            'from': 'users',
            'foreignField': '_id',
            'localField': 'userId',
            'as': 'user'
          }
        },
        {
          $lookup: {
            'from': 'educations',
            'foreignField': 'userId',
            'localField': 'userId',
            'as': 'educationDetail'
          }
        },
        {
          $unwind: '$user',
        },
        {
          $unwind: '$educationDetail',
        },
        {
          $project: {
            userId: 1,
            profileImage: 'image',
            fullName: 1,
            age: 1,
            gender: 1,
            gotra: 1,
            city: 1, 
            state: 1,
            workWith: '$educationDetail.workWith'
          }
        }
      ]);
      
      return res.status(200).json({ success: true, data: matches, message: "Matches fetch successfully" });

    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async getFields__(req, res, next) {
    try {
      let user = await User.findOne({ _id: req._id });

      if (!user) {
        return res
          .status(404)
          .send({ success: false, data: {}, message: "User not found" });
      }
      let progress = user.progress;
      let progressNumbers = [2, 3, 4, 6, 7, 11];
      let fields = {};

      if (progressNumbers.includes(progress)) {
        let profile = await Profile.findOne({ userId: req.user._id });

        if (progress == 2) {
          fields.creatingProfileFor = profile.creatingProfileFor;
          fields.martialStatus = profile.martialStatus;
          fields.kundliMatch = profile.kundliMatch;
          fields.bioDataImage = profile.bioDataImage;
          return res
            .status(200)
            .send({
              success: true,
              progress,
              data: fields,
              message: "Profile fields",
            });
        } else if (progress == 3) {
          fields.fullName = profile.fullName;
          fields.gotra = profile.gotra;
          fields.dob = profile.dob;
          fields.birthTime = profile.birthTime;
          fields.gender = profile.gender;
          fields.city = profile.city;
          fields.state = profile.state;
          fields.age = profile.age;
          return res
            .status(200)
            .send({
              success: true,
              progress,
              data: fields,
              message: "Profile fields",
            });
        } else if (progress == 4) {
          fields.currentLocation = profile.currentLocation;
          fields.willingRelocate = profile.willingRelocate;
          fields.liveWithFamily = profile.liveWithFamily;
          return res
            .status(200)
            .send({
              success: true,
              progress,
              data: fields,
              message: "Profile fields",
            });
        } else if (progress == 6) {
          fields.heigth = profile.heigth;
          fields.weigth = profile.weigth;
          fields.bodyType = profile.bodyType;
          fields.complexion = profile.complexion;
          return res
            .status(200)
            .send({
              success: true,
              progress,
              data: fields,
              message: "Profile fields",
            });
        } else if (progress == 7) {
          fields.diet = profile.diet;
          fields.drink = profile.drink;
          fields.smoke = profile.smoke;
          fields.havingPet = profile.havingPet;
          return res
            .status(200)
            .send({
              success: true,
              progress,
              data: fields,
              message: "Profile fields",
            });
        } else if (progress == 11) {
          fields.expressYourself = profile.expressYourself;
          return res
            .status(200)
            .send({
              success: true,
              progress,
              data: fields,
              message: "Profile fields",
            });
        }
      } else if (progress == 5) {
        let education = await Education.findOne({ userId: req._id });

        fields.highestQualification = education.highestQualification;
        fields.collegeName = education.collegeName;
        fields.workWith = education.workWith;
        return res
          .status(200)
          .send({
            success: true,
            progress,
            data: fields,
            message: "Profile fields",
          });
      } else if (progress == 8) {
        let family = await Family.findOne({ userId: req._id });

        fields.fatherName = family.fatherName;
        fields.fathersJob = family.fathersJob;
        fields.motherName = family.motherName;
        fields.mothersJob = family.mothersJob;
        fields.brothers = family.brothers;
        fields.sisters = family.sisters;
        fields.brothersName = family.brothersName;
        fields.brothersJob = family.brothersJob;
        fields.sistersName = family.sistersName;
        fields.sistersJob = family.sistersJob;
        fields.marriedBrothers = family.marriedBrothers;
        fields.unMarriedBrothers = family.unMarriedBrothers;
        fields.marriedSisters = family.marriedSisters;
        fields.unMarriedSisters = family.unMarriedSisters;

        return res
          .status(200)
          .send({
            success: true,
            progress,
            data: fields,
            message: "Profile fields",
          });
      } else if (progress == 9) {
        let socialInfo = await SocialInfo.findOne({ userId: req._id });

        fields.facebookLink = socialInfo.facebookLink;
        fields.fbAccessibility = socialInfo.fbAccessibility;
        fields.instagramLink = socialInfo.instagramLink;
        fields.instaAccessibility = socialInfo.instaAccessibility;
        fields.linkedinLink = socialInfo.linkedinLink;
        fields.linkedinAccessibility = socialInfo.linkedinAccessibility;
        fields.whatsappNumber = socialInfo.whatsappNumber;
        fields.whatsappAccessibility = socialInfo.whatsappAccessibility;

        return res
          .status(200)
          .send({
            success: true,
            progress,
            data: fields,
            message: "Profile fields",
          });
      } else if (progress == 10) {
        let partnerInfo = await PartnerPreference.findOne({ userId: req._id });

        fields.city = partnerInfo.city;
        fields.age = partnerInfo.age;
        fields.heigth = partnerInfo.heigth;
        fields.martialStatus = partnerInfo.martialStatus;
        fields.excludedGotra = partnerInfo.excludedGotra;
        fields.state = partnerInfo.state;
        fields.annualIncome = partnerInfo.annualIncome;

        return res
          .status(200)
          .send({
            success: true,
            progress,
            data: fields,
            message: "Profile fields",
          });
      } else {
        return res
          .status(400)
          .send({
            success: false,
            data: {},
            message: "Invalid progress value",
          });
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  async editProfileOld(req, res, next) {
    try {
      const user = await User.findOne({ _id: req._id });

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const form = new multiparty.Form();
      const { fields, files } = await parseFormAsync(form, req);

      const updatedUserData = {};
      for (const key in fields) {
        if (fields.hasOwnProperty(key)) {
          updatedUserData[key] = fields[key][0];
        }
      }

      if (files.image && files.image[0].originalFilename) {
        const fileupload = files.image[0];
        const image = await uploadImageAPI(fileupload, "user");
        updatedUserData.avatar = image.key;
      }

      await User.findOneAndUpdate({ _id: req._id }, updatedUserData);
      const _user = await User.findOne({ _id: req._id });
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: { user: _user },
      });
    } catch (err) {
      console.error(err);
      return next(err);
    }
  }

}

module.exports = new UserController();

function parseFormAsync(form, req) {
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}

function calculateAge(dob) {
  const today = moment();
  const birthDate = moment(dob,  'DD/MM/YYYY'); // Assuming the date format is dd/mm/yyyy
  const age = today.diff(birthDate, 'years');
  return age;
}

