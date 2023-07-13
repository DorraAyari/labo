const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Middleware to verify the JWT token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
 // console.log("Token:", token); // Check the token value in the console

  if (!token || !token.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token not provided" });
  }

  const tokenValue = token.split(" ")[1]; // Extract the token value without the prefix
  jwt.verify(tokenValue, "your-secret-key", (err, decoded) => {
    //console.log("Decoded:", decoded); // Check the decoded object in the console

    req.user = decoded; // Set the decoded user information in the request object
    next();
  });
};

router.get("/", authenticateUser, async (req, res) => {
  try {
   
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authenticateUser, async (req, res) => {
  try {
    const { name, email, password, dateOfBirth } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    if (req.user.role !== "responsable") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      dateOfBirth,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/verifrequete", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "responsable") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }

    res.status(201).json({ message: "veriif" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "responsable") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "responsable") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const { name, email, password, dateOfBirth, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        password: hashedPassword,
        dateOfBirth,
        role,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "responsable") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
