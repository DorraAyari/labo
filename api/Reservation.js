const express = require('express');
const router = express.Router();
const Reservation = require('./../models/reservationModel');
const Material = require('./../models/materielModel');
const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  console.log('Token:', token); // Check the token value in the console

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token not provided' });
  }

  const tokenValue = token.split(' ')[1]; // Extract the token value without the prefix
  jwt.verify(tokenValue, 'your-secret-key', (err, decoded) => {
    console.log('Decoded:', decoded); // Check the decoded object in the console

    req.user = decoded; // Set the decoded user information in the request object
    next();
  });
};

router.post('/', authenticateUser, async (req, res) => {
  try {
    const { materialId, startDateTime, endDateTime } = req.body;

    // Check if the material exists
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check if the startDateTime and endDateTime are valid
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    if (startDate >= endDate) {
      return res.status(400).json({ message: 'Invalid start and end date/time' });
    }

    // Check if the material is already reserved for the given time range
    const existingReservation = await Reservation.findOne({
      material: materialId,
      startDateTime: { $lt: endDate },
      endDateTime: { $gt: startDate },
      user: req.user.userId, // Assign the user ID from the authenticated user
    });

    if (existingReservation && material.quantityAvailable === 0) {
      return res.status(409).json({ message: 'Material already reserved for the given time range' });
    }

    // Create the reservation
    if (material.quantityAvailable > 0) {
      const reservation = await Reservation.create({
        reservationId: 'reservation_' + Date.now(),
        material: materialId,
        startDateTime: startDate,
        endDateTime: endDate,
        user: req.user.userId, // Assign the user ID from the authenticated user
      });

      // Update the quantityAvailable of the material
      material.quantityAvailable -= 1;
      await material.save();

      res.status(201).json(reservation);
    } else {
      res.status(409).json({ message: 'Material is not available for reservation' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
