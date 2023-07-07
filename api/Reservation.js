const express = require("express");
const router = express.Router();
const Reservation = require("./../models/reservationModel");
const Material = require("../models/equipementModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  console.log("Token:", token); // Check the token value in the console

  if (!token || !token.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token not provided" });
  }

  const tokenValue = token.split(" ")[1]; // Extract the token value without the prefix
  jwt.verify(tokenValue, "your-secret-key", (err, decoded) => {
    console.log("Decoded:", decoded); // Check the decoded object in the console

    req.user = decoded; // Set the decoded user information in the request object
    next();
  });
};

router.post("/", authenticateUser, async (req, res) => {
  try {
    const { materialId, startDateTime, endDateTime } = req.body;

    // Check if the material exists
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    // Check if the startDateTime and endDateTime are valid
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    if (startDate >= endDate) {
      return res
        .status(400)
        .json({ message: "Invalid start and end date/time" });
    }

    // Check if the material is already reserved for the given time range
    const existingReservation = await Reservation.findOne({
      material: materialId,
      startDateTime: { $lt: endDate },
      endDateTime: { $gt: startDate },
      user: req.user.userId, // Assign the user ID from the authenticated user
      status: "pending", // Set the initial status as "pending"
    });

    if (existingReservation && material.quantityAvailable === 0) {
      return res
        .status(409)
        .json({
          message: "Material already reserved for the given time range",
        });
    }

    // Create the reservation
    if (material.quantityAvailable > 0) {
      const reservation = await Reservation.create({
        reservationId: "reservation_" + Date.now(),
        material: materialId,
        startDateTime: startDate,
        endDateTime: endDate,
        user: req.user.userId, // Assign the user ID from the authenticated user
        status: "pending", // Set the initial status as "pending"
      });
      res.status(201).json({ reservationId: reservation._id });

      // Update the quantityAvailable of the material
      material.quantityAvailable -= 1;
      await material.save();
    } else {
      return res
        .status(409)
        .json({ message: "Material is not available for reservation" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", authenticateUser, async (req, res) => {
  try {
    // Fetch all reservations
    const reservations = await Reservation.find();

    res.json({ reservations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... other code ...

router.put("/:reservationId", authenticateUser, async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { action } = req.body;

    // Fetch the reservation to be approved/rejected
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    // Vérifier si l'utilisateur connecté est le responsable de la réservation
    if (req.user.role !== "responsable") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    // Check if the reservation is already approved or rejected
    if (reservation.status !== "pending") {
      return res.status(400).json({ message: "Reservation already processed" });
    }

    // Update the reservation status based on the action
    if (action === "approve") {
      reservation.status = "approved";
    } else if (action === "reject") {
      reservation.status = "rejected";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    // Save the updated reservation
    await reservation.save();

    // Send an email to the user regarding the reservation status
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
      text: `Your reservation with ID ${reservationId} has been ${reservation.status}.`,
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
