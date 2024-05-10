const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid token format' });
  }
  const accessToken = tokenParts[1];
  jwt.verify(accessToken, 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
};

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
});

router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user._id }, 'secret', { expiresIn: '1h' });
      res.status(200).json({ message: "Logged in successfully", token: token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/signout', (req, res) => {
    res.clearCookie('token').json({ message: 'Signed out successfully' });
});

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    console.log(req)
    const email = req.user.email;

    const user = await User.findOne(email);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;