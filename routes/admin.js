const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authenticateAdminToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.log(decoded)
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = decoded;
    next();
  });
};

router.put('/update-role/:userId', authenticateAdminToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    console.log(userId, role)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log()
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
