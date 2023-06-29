const express = require('express');
const router = express.Router();
const User = require('./../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Helper function to generate a JWT token
const generateToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const options = {
    expiresIn: '1h', // Token expiration time
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
    res.json({
      status: 'FAILED',
      message: 'Empty input fields',
    });
  } else if (!/^[a-zA-Z]+$/.test(name)) {
    res.json({
      status: 'FAILED',
      message: 'Invalid name entered',
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: 'FAILED',
      message: 'Invalid email entered',
    });
  } else if (password.length < 8) {
    res.json({
      status: 'FAILED',
      message: 'Invalid password entered',
    });
  } else {
    User.find({ email })
      .then((result) => {
        if (result.length) {
          res.json({
            status: 'FAILED',
            message: 'User with the provided email already exists',
          });
        } else {
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                name,
                email,
                password: hashedPassword,
                dateOfBirth,
              });
              newUser
                .save()
                .then((result) => {
                  const token = generateToken(result); // Generate token for the newly registered user
                  res.json({
                    status: 'SUCCESS',
                    message: 'Signup successful',
                    data: {
                      user: result,
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
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: 'FAILED',
          message: 'An error occurred while checking for existing user',
        });
      });
  }
});
router.post('/signin', (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();
  if (email == "" || password == "") {
    res.json({
      status: 'FAILED',
      message: 'Empty credentials supplied'
    })
  } else {
    User.find({ email })
      .then(data => {
        if (data.length) {
          const hashedPassword = data[0].password;
          bcrypt.compare(password, hashedPassword).then(result => {
            if (result) {
              const token = generateToken(data[0]); // Generate token for the authenticated user
              res.json({
                status: 'SUCCESS',
                message: 'Signin successful',
                data: {
                  user: data[0],
                  token: token,
                },
              })
            }
            else {
              res.json({
                status: 'FAILED',
                message: 'Invalid password entered',
              })
            }
          }).catch(err => {
            res.json({
              status: 'FAILED',
              message: 'An error occurred while comparing passwords',
            })
          })
        } else {
          res.json({
            status: 'FAILED',
            message: 'Invalid credentials entered',
          })
        }
      })
      .catch(err => {
        res.json({
          status: 'FAILED',
          message: 'An error occurred while checking for existing user',
        })
      })
  }
});


module.exports = router;
