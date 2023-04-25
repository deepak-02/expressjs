const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    email: String,
    firstname: String,
    lastname:String,
    phone: String,
    address:String,
    gender:String,

});

const Profile = mongoose.model("profile", profileSchema);

module.exports = Profile;