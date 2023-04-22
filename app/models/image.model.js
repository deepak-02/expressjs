const mongoose = require('mongoose');


const Image = mongoose.model(
    "Image",
    new mongoose.Schema({
        email: String,
        image: {
            data: Buffer,
            contentType: String
        }
    })
);

module.exports = Image;
