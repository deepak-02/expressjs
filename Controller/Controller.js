
const userModel = require("../Models/Users");
const profileModel = require("../Models/Profile");
const otpModel = require("../Models/Otp");
const imageModel = require("../Models/image");
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const multer = require('multer');

const bcrypt=require('bcrypt')

const controller = require('./Controller');
const {response} = require("express");




exports.uploadImage= async (req, res) => {
    // console.log(req.file.buffer.toString("base64"))
    const file = new imageModel({
        email:req.body.email,
        name: req.file.originalname,
        data: req.file.buffer.toString('base64')
    });
    await file.save();
    res.send('File uploaded successfully');
};



exports.verifyOtp =async (req, res) => {
    const {email,otp}=req.body;
    console.log("{email,otp}")
    console.log({email,otp})

   const verify= await otpModel.findOne({email:email,otp:otp.toString()})

    if(verify){
        return res.status(200).json({message:"otp verified"});
    }
    else {
        return res.status(202).json({message:"invalid otp"});
    }
   //  console.log("verify........")
   // console.log(verify);
};

exports.mail = (req, res) => {


    const email = req.body.email;
    const randomNumber = Math.floor(Math.random() * 10000);
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'ptfattendanceapp@gmail.com',
            pass: 'vkxhfuwbaygppaim',
        },
    });


    // setup email data with unicode symbols
    const mailOptions = {
        from: 'ptfattendanceapp@gmail.com', // sender address
        to: email, // list of receivers
        subject: 'Sending Email using Node.js', // Subject line
        text: `Dear user, \n"Otp to reset your password :"${randomNumber}`, // plain text body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send({error: 'Error sending email'});
        } else {
            console.log('otp saved ');
            await otpModel.create({
                email: email,
                otp: randomNumber.toString()
            })
            res.status(200).send({message: 'Email sent successfully'});
        }
    });




};




exports.profile =async (req, res) => {
    const {email, firstname,lastname, phone,gender} = req.body;
    const existingProfile=await profileModel.findOne({email:email})
    console.log("body",{email, firstname,lastname, phone,gender}  )
    await profileModel.findByIdAndUpdate(existingProfile._id,req.body)

    // await profileModel.create({email, name, phone,department} );
    return res.status(200).json({message:"profile saved successfully"})
};

 exports.signup=async (req,res)=>{
    const {username,email,password}=req.body;
    const {firstname,lastname}=req.body;
    await profileModel.create({firstname,lastname,email})
    console.log("signup body "+ {username,email,password})
    try{

        const existingUser=await userModel.findOne({email:email})
        console.log("existingUser ",existingUser)
        if(existingUser!=null){
            return res.status(400).json({message:"username or email already taken"});
        }
        else {
        const hashedPassword=await bcrypt.hash(password,10);
        const result=await userModel.create({
            email:email,
            password:hashedPassword,
            username:username
        });
return res.status(200).json({message: "Signup successful"})
    }}
    catch(error){
        console.log(error);
    }
}

exports.signin=async (req, res) => {
    const {username, password} = req.body;
    const existingUser = await userModel.findOne({username: username})
    if (existingUser) {
        const matchPassword =await bcrypt.compare(password, existingUser.password)

        console.log("match password "+matchPassword.toString())
        if (matchPassword) {
            return res.status(200).json({message: "Login Success"})
        } else {
            return res.status(400).json({message: "invalid credentials"});

        }
    }
    else{
        return res.status(202).json({message:"user not found"})
        }
    }


exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
console.log("body",{ email, newPassword })
    try {
        // Find the user with the given email
        const user = await userModel.findOne({ username:email });

        // If the user is not found, return an error
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();

        // Return a success message
        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

// const storage = multer.memoryStorage();
// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 1000000 },
//     fileFilter: function (req, file, cb) {
//         if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') {
//             cb(new Error('Only JPEG and PNG files are allowed'));
//         } else {
//             cb(null, true);
//         }
//     }
// });
//
// router.post('/images', upload.single('image'), async (req, res) => {
//     const imageData = {
//         name: req.file.originalname,
//         data: req.file.buffer.toString('base64')
//     };
//
//     try {
//         const image = new Image(imageData);
//         await image.save();
//         res.status(201).json(image);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });
exports.getImage = async (req, res) => {
    const email = req.body.email;
    // console.log("email", name)
    const existingImage = await imageModel.findOne({email: email})
    console.log("exists", existingImage)
    if (existingImage) {
        return res.status(200).json(existingImage)
    } else {
        return res.status(400).json({message: "image not found"});

    }
}

exports.getProfile = async (req, res) => {
    const email = req.body.email;
    console.log("email",email)
    const existingUser = await profileModel.findOne({email: email})
    console.log("exists",existingUser)
    if (existingUser) {
            return res.status(200).json(existingUser)
        } else {
            return res.status(400).json({message: "user not found"});

        }
};
