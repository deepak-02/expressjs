const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const controller = require("./Controller/Controller");
const multer = require("multer");
const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// connect to the database
mongoose.connect("mongodb://mongo:pkXqGFHl81l1yNL3ZgAn@containers-us-west-128.railway.app:6951", { useNewUrlParser: true, useUnifiedTopology: true });

// use bodyParser middleware to parse incoming requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// define the routes for our API
app.post("/api/otp/verify", controller.verifyOtp);

app.post("/api/email/get-otp", controller.mail);

app.post("/api/password/reset", controller.resetPassword);

app.post("/api/signup", controller.signup);

app.post("/api/signin", controller.signin);

app.post("/api/profile/save", controller.profile);

app.post("/api/profile/get", controller.getProfile);

app.post("/api/profile/image-get", controller.getImage);

app.post("/api/profile/image", upload.single('file'), controller.uploadImage);

// router.post('/upload', upload.single('file'),

// start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
