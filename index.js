const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const controller = require("./Controller/Controller");
const multer = require("multer");
const app = express();
var port = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// connect to the database
// mongoose.connect("mongodb+srv://akhilnmptf:qJ2Ms92N9MIBTLRs@cluster0.ygch4vp.mongodb.net/?retryWrites=true&w=majority", 
//                  { useNewUrlParser: true, 
//                   useUnifiedTopology: true }
//                 );
mongoose.connect(`mongodb+srv://akhilnmptf:qJ2Ms92N9MIBTLRs@cluster0.ygch4vp.mongodb.net/?retryWrites=true&w=majority`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connect to MongoDB.");
        
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

app.get("/", (req, res) => {
    res.json({ message: "Welcome to akhil application." });
});


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

app.post("/api/profile/delete-image", controller.deleteImage);
// router.post('/upload', upload.single('file'),

// start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
