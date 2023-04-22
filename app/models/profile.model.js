const mongoose = require("mongoose");

const Profile = mongoose.model(
    "Profile",
    new mongoose.Schema({
        name: String,
        email: String,
        phone: String,
        address: String,

    })
);

module.exports = Profile;

