const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");

router.get("/hello", (req, res) => {
    res.status(200).json("Hello World");
})

router.post("/register", async (req, res) => {
    try {
        const {username, email, password, profilePhoto, bio, phone, isPublic} = req.body;

        let user = await User.findOne({email});
        if (user) {
            return res.status(400).json({message: 'User already exists'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            username,
            email,
            password: hashedPassword,
            profilePhoto,
            bio,
            phone,
            isPublic,
        });
        await user.save();

        res.status(201).json({message: 'User registered successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Inputs invalid', err: error});
    }
})

module.exports = router;