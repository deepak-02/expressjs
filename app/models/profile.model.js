const mongoose = require("mongoose");

const Profile = mongoose.model(
    "Profile",
    new mongoose.Schema({
        name: String,
        email: String,
        phone: String,
        address: String,
        gender: String
    })
);

module.exports = Profile;

