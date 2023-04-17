const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Image = db.image;
const Role = db.role;
const Profile = db.profile;
const Otp = db.otp;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');



exports.signup = (req, res) => {
    console.log("signup called");

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
    });

    user.save()
        .then((user) => {
            if (req.body.roles) {
                Role.find(
                    {
                        name: { $in: req.body.roles },
                    }
                )
                    .then((roles) => {
                        user.roles = roles.map((role) => role._id);
                        user.save()
                            .then(async () => {

                                const existingProfile = await Profile.findOne({ email: req.body.email });
                                if (!existingProfile){
                                    const newProfile = new Profile({
                                        name: req.body.name,
                                        email: req.body.email,
                                    });
                                    await newProfile.save();
                                    res.send({ message: "User was registered successfully!" });
                                }else {
                                    res.send({ message: "Profile already exists!" });
                                }

                            })
                            .catch((err) => {
                                res.status(500).send({ message: err });
                            });
                    })
                    .catch((err) => {
                        res.status(500).send({ message: err });
                    });
            } else {
                Role.findOne({ name: "user" })
                    .then((role) => {
                        user.roles = [role._id];
                        user.save()
                            .then(async () => {

                                const existingProfile = await Profile.findOne({ email: req.body.email });
                                if (!existingProfile){
                                    const newProfile = new Profile({
                                        name: req.body.name,
                                        email: req.body.email,
                                    });
                                    await newProfile.save();
                                    res.send({ message: "User was registered successfully!" });
                                }else {
                                    res.send({ message: "Profile already exists!" });
                                }





                            })
                            .catch((err) => {
                                res.status(500).send({ message: err });
                            });
                    })
                    .catch((err) => {
                        res.status(500).send({ message: err });
                    });
            }
        })
        .catch((err) => {
            res.status(500).send({ message: err });
        });
};

exports.signin = (req, res) => {

    console.log("login called");

    User.findOne({
        email: req.body.email,
    })
        .populate("roles", "-__v")

        .then((user) => {
            //if succeded do this block of code
            if (!user) {
                return res.status(403).send({ message: "User Not found." });
            }

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({ message: "Invalid Password!" });
            }

            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400, // 24 hours
            });

            var authorities = [];

            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
            }

            req.session.token = token;

            res.status(200).send({
                id: user._id,
                name: user.name,
                email: user.email,
                address: user.address,
                phone: user.phone,
                roles: authorities,
            });
        }).catch((err) => {
        //catch error
        res.status(500).send({ message: err });
    })
};

exports.signout = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({ message: "You've been signed out!" });
    } catch (err) {
        this.next(err);
    }
};


exports.profileUpdate = async (req, res) => {
    console.log("profile update called");

    try {
        const existingProfile = await Profile.findOne({ email: req.body.email });
        if (existingProfile) {
            // If profile exists, update it
            const updatedProfile = await Profile.findByIdAndUpdate(existingProfile._id, req.body, {
                new: true,
                runValidators: true,
            });
            res.send(updatedProfile);
        } else {
            // If profile doesn't exist, create a new one
            const newProfile = new Profile(req.body);
            await newProfile.save();
            res.status(201).send(newProfile);
        }
    } catch (error) {
        res.status(400).send(error);
    }

};

exports.getProfile = (req, res) => {

    console.log("get profile called");

    Profile.findOne({
        email: req.body.email,
    })

        .then((profile) => {
            //if succeded do this block of code
            if (!profile) {
                return res.status(403).send({ message: "User Not found." });
            }

            Image.findOne({
                email: req.body.email,
            }).then((image) => {
                res.status(200).send({
                    profile:profile,
                    image:image,
                });
            }).catch((err) => {
                //catch error
                res.status(500).send({ message: err });
            })

            // res.status(200).send({
            //     profile
            //     // id: profile._id,
            //     // name: profile.name,
            //     // email: profile.email,
            //     // address: profile.address,
            //     // phone: profile.phone,
            // });
        }).catch((err) => {
        //catch error
        res.status(500).send({ message: err });
    })
};

exports.getOtp = async (req, res) => {

    console.log("get otp called");

    const _otp = otpGenerator.generate(6, {digits: true, lowerCaseAlphabets: false , upperCaseAlphabets: false, specialChars: false });

    const otp = new Otp({
        otp: _otp,
        email: req.body.email,
    });

    otp.save()


        .then((otp) => {
            //if succeded do this block of code

            // create a transporter object using SMTP transport
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'ptfattendanceapp@gmail.com', // replace with your Gmail email address
                    pass: 'vkxhfuwbaygppaim' // replace with your Gmail password
                }
            });

// define email options
            const mailOptions = {
                from: 'your_email@gmail.com',
                to: req.body.email,
                subject: 'One-Time Password (OTP)',
                text: `Your OTP is ${otp.otp}. This OTP is valid for 5 minutes.`
            };

// send email with OTP
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });



            res.status(200).send({
                message: "Otp send"
            });

            setTimeout(() => {
                Otp.deleteOne({ email: req.body.email })
                    .then(result => {
                        console.log("Otp deleted");
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }, 5 * 60 * 1000); // 5 minute



        }).catch((err) => {
        //catch error
        res.status(500).send({ message: err });
    })
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await Otp.findOne({ email }).exec();
        if (!otpRecord) {
            return res.status(404).send({ message: "OTP not found for the given email" });
        }

        if (otpRecord.otp === otp) {
            // OTPs match
            Otp.deleteOne({ email: email })
                .then(result => {
                    console.log("Otp deleted");
                })
                .catch(error => {
                    console.error(error);
                });

            return res.status(200).send({ message: "OTP verified successfully" });


        } else {
            // OTPs don't match
            return res.status(400).send({ message: "Invalid OTP" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: `${err}` });
    }
};

exports.resetPassword = async (req, res) => {
    console.log("reset password called");

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        // hash the new password
        const hashedPassword = bcrypt.hashSync(password, 8);

        // update the user's password
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { password: hashedPassword },
        );

        res.status(200).send({ message: "Password reset successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};



//upload-image route for handling image uploads

// exports.uploadImage =  async (req, res) => {
//     try {
//         // save image to database
//         const image = new Image({
//             email: req.body.email,
//             image: {
//                 data: req.file.buffer,
//                 contentType: req.file.mimetype
//             }
//         });
//         await image.save();
//         res.status(201).send('Image uploaded successfully!');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Failed to upload image!');
//     }
// };


exports.uploadImage = async (req, res) => {
    try {
        // find the existing image for the given email
        const existingImage = await Image.findOne({ email: req.body.email });

        if (existingImage) {
            // if an image already exists for the email, update the data and contentType
            existingImage.image.data = req.file.buffer;
            existingImage.image.contentType = req.file.mimetype;

            await existingImage.save();
            res.status(200).send('Image updated successfully!');
        } else {
            // if no image exists for the email, create a new image
            const image = new Image({
                email: req.body.email,
                image: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype,
                },
            });

            await image.save();
            res.status(201).send('Image uploaded successfully!');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to upload image!');
    }
};
