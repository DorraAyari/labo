const express = require("express");
const router = express.Router();
const User = require("./../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Helper function to generate a JWT token
const generateToken = (user) => {
  const payload = {
    name: user.name,
    email: user.email,
    role: user.role,
    userId: user._id,
  };

  const options = {
    expiresIn: 12000, // Token expiration time
  };

  // Generate and return the token
  return jwt.sign(payload, "your-secret-key", options);
};

router.post("/signup", (req, res) => {
  let { name, email, password, dateOfBirth,role,lastname } = req.body;
  console.log(req.body);
  name = name.trim();
  lastname = lastname.trim();

  email = email.trim();
  password = password.trim();
  dateOfBirth = dateOfBirth.trim();
  role = role.trim();

  console.log(role);

  if (name === "" || email === "" || password === "" || dateOfBirth === ""|| lastname === "") {
    return res.json({
      status: "FAILED",
      message: "Empty input fields",
    });
  }

  if (!/^[a-zA-Z]+$/.test(name)) {
    return res.json({
      status: "FAILED",
      message: "Invalid name entered",
    });
  }
  if (!/^[a-zA-Z]+$/.test(lastname)) {
    return res.json({
      status: "FAILED",
      message: "Invalid name entered",
    });
  }

  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.json({
      status: "FAILED",
      message: "Invalid email entered",
    });
  }

  if (password.length < 8) {
    return res.json({
      status: "FAILED",
      message: "Invalid password entered",
    });
  }

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res.json({
          status: "FAILED",
          message: "User with the provided email already exists",
        });
      }

      const saltRounds = 10;
      bcrypt
        .hash(password, saltRounds)
        .then((hashedPassword) => {
          const newUser = new User({
            role,
            name,
            lastname,

            email,
            password: hashedPassword,
            dateOfBirth,
          });

          newUser
            .save()
            .then((result) => {
              const { _id, name, email, role } = result; // Extract the user ID from the saved result
              const token = generateToken(result); // Generate token for the newly registered user
              const userId = result.userId; // Access the user ID from the saved result

              res.json({
                status: "SUCCESS",
                message: "Signup successful",
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
                status: "FAILED",
                message: "An error occurred while saving user account",
              });
            });
        })
        .catch((err) => {
          res.json({
            status: "FAILED",
            message: "An error occurred while hashing the password",
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "FAILED",
        message: "An error occurred while checking for existing user",
      });
    });
});






router.post("/usermdp", async (req, res) => {
  let { email } = req.body;
  const exist = await User.findOne({ email }).exec();
  console.log(exist._id)  
  try {
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "fd50e9e045b5e0",
        pass: "0cb81a727eab0c",
      },
    });
    const mailOptions = {
      from: "dorra.ayari@esprit.tn",
      to: "dorra.ayari@esprit.tn",
      subject: "mdp recuperation",
      text: `Voici votre lien pour changer le mot de passe copier le : http://localhost:8080/#/mdpoublier/${exist._id}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email" });
      } else {
        console.log("Email sent:", info.response);
        // No response needed here, as the response has already been sent before this callback.
      }
    });

    res.status(200).json({status: "SUCCESS",
    message: "send successful",});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }


  
});





router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        password: hashedPassword, // Mettez à jour le mot de passe haché
      },
      { new: true } // Pour obtenir l'utilisateur mis à jour dans la réponse
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




router.post("/exist", (req, res) => {
  let { email } = req.body;

  email = email.trim();

  if (email === "" ) {
    return res.json({
      status: "FAILED",
      message: "Empty credentials supplied",
    });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.json({
          status: "FAILED",
          message: "Invalid credentials entered",
        });
      }
      
          else {
           
            res.json({
              status: "SUCCESS",
              message: "exist",
              
            });
          } 
        })
        
});





router.post("/signin", (req, res) => {
  let { email, password } = req.body;

  email = email.trim();
  password = password.trim();

  if (email === "" || password === "") {
    return res.json({
      status: "FAILED",
      message: "Empty credentials supplied",
    });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.json({
          status: "FAILED",
          message: "Invalid credentials entered",
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
              status: "SUCCESS",
              message: "Signin successful",
              data: {
                user: user,
                userId: user._id, // Use the user ID as userId
                token: token,
              },
            });
          } else {
            res.json({
              status: "FAILED",
              message: "Invalid password entered",
            });
          }
        })
        .catch((err) => {
          res.json({
            status: "FAILED",
            message: "An error occurred while comparing passwords",
          });
        });
    })
    .catch((err) => {
      res.json({
        status: "FAILED",
        message: "An error occurred while checking for existing user",
      });
    });
});



/*
router.get("/usermdp", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "fd50e9e045b5e0",
        pass: "0cb81a727eab0c",
      },
    });
    const mailOptions = {
      from: "dorra.ayari@esprit.tn",
      to: "dorra.ayari@esprit.tn",
      subject: "Reservation Status",
      text: `voici votre lien pour changer le mot du passe ${"ggggg"} .`,
    };
    console.log("ziz")
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email" });
      } else {
        console.log("Email sent:", info.response);
        // No response needed here, as the response has already been sent before this callback.
      }
    });

    res.status(200).json({status: "SUCCESS",
    message: "send successful",});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }


  
});*/








module.exports = router;
