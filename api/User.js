const express = require('express');
const router = express.Router();
const User = require('./../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT token
const generateToken = (user) => {
  const payload = {
    name: user.name,
    email: user.email,
    role: user.role,
    userId: user._id,
  };

  const options = {
    expiresIn: 120, // Token expiration time
  };

  // Generate and return the token
  return jwt.sign(payload, 'your-secret-key', options);
};


router.post('/signup', (req, res) => {
  let { name, email, password, dateOfBirth } = req.body;
  name = name.trim();
  email = email.trim();
  password = password.trim();
  dateOfBirth = dateOfBirth.trim();

  if (name === '' || email === '' || password === '' || dateOfBirth === '') {
    return res.json({
      status: 'FAILED',
      message: 'Empty input fields',
    });
  }

  if (!/^[a-zA-Z]+$/.test(name)) {
    return res.json({
      status: 'FAILED',
      message: 'Invalid name entered',
    });
  }

  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.json({
      status: 'FAILED',
      message: 'Invalid email entered',
    });
  }

  if (password.length < 8) {
    return res.json({
      status: 'FAILED',
      message: 'Invalid password entered',
    });
  }

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res.json({
          status: 'FAILED',
          message: 'User with the provided email already exists',
        });
      }

      const saltRounds = 10;
      bcrypt
        .hash(password, saltRounds)
        .then((hashedPassword) => {
          const newUser = new User({
            name,
            email,
            password: hashedPassword,
            dateOfBirth
          });

          newUser.save()
          .then((result) => {
            const { _id, name, email, role } = result; // Extract the user ID from the saved result
            const token = generateToken(result); // Generate token for the newly registered user
            const userId = result.userId; // Access the user ID from the saved result
        
            res.json({
              status: 'SUCCESS',
              message: 'Signup successful',
              data: {
                user: {
                  _id,
                  name,
                  userId, // Use the user ID as userId
                  email,
                  role,
                },
                token: token,
              },
            });
          })
          .catch((err) => {
            res.json({
              status: 'FAILED',
              message: 'An error occurred while saving user account',
            });
          });
        
        })
        .catch((err) => {
          res.json({
            status: 'FAILED',
            message: 'An error occurred while hashing the password',
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: 'FAILED',
        message: 'An error occurred while checking for existing user',
      });
    });
});

router.post('/signin', (req, res) => {
  
  let { email, password } = req.body;

  email = email.trim();
  password = password.trim();

  if (email === '' || password === '') {
    return res.json({
      status: 'FAILED',
      message: 'Empty credentials supplied',
    });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.json({
          status: 'FAILED',
          message: 'Invalid credentials entered',
        });
      }
      const token = generateToken(user); // Generate token for the authenticated user

      const hashedPassword = user.password;
      bcrypt
        .compare(password, hashedPassword)
        .then((result) => {
          if (result) {
            const token = generateToken(user); // Generate token for the authenticated user
            res.json({
              status: 'SUCCESS',
              message: 'Signin successful',
              data: {
                user: user,
                userId: user._id, // Use the user ID as userId
                token: token,
              },
            });
          } else {
            res.json({
              status: 'FAILED',
              message: 'Invalid password entered',
            });
          }
        })
        .catch((err) => {
          res.json({
            status: 'FAILED',
            message: 'An error occurred while comparing passwords',
          });
        });
    })
    .catch((err) => {
      res.json({
        status: 'FAILED',
        message: 'An error occurred while checking for existing user',
      });
    });
});

module.exports = router;
