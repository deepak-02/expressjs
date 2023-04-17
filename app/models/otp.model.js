const mongoose = require("mongoose");

const Otp = mongoose.model(
    "Otp",
    new mongoose.Schema({
        email: String,
        otp: String,
    })
);

module.exports = Otp;
