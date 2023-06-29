const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Middleware to verify the JWT token
// Middleware to verify the JWT token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Authorization token not provided' });
  }

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
   
    req.user = decoded; // Set the decoded user information in the request object
    next();
  });
};

router.get('/', authenticateUser, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateUser, async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
