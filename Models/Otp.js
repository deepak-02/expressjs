const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: String,
    otp: String
});

const Otp = mongoose.model("otp", otpSchema);

module.exports = Otp;