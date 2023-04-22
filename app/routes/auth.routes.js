const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const multer = require('multer');

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/auth/signup",
        [
            verifySignUp.checkDuplicateUsernameOrEmail,
            verifySignUp.checkRolesExisted
        ],
        controller.signup
    );

    app.post("/api/auth/signin", controller.signin);

    app.post("/api/auth/signout", controller.signout);

    app.post("/api/profile/update", controller.profileUpdate);

    app.post("/api/profile/get", controller.getProfile);

    app.post("/api/get-otp", controller.getOtp);

    app.post("/api/verify-otp", controller.verifyOtp);

    app.post("/api/reset-password", controller.resetPassword);

    // configure multer for handling file uploads
    const upload = multer({
        limits: { fileSize: 5000000 }, // limit file size to 1MB
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return cb(new Error('Only image files are allowed!'));
            }
            cb(null, true);
        }
    });


    app.post('/api/upload-image', upload.single('image'), controller.uploadImage);
};

