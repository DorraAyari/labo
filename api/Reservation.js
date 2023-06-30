const express = require('express');
const router = express.Router();
const Reservation = require('./../models/reservationModel');
const Material = require('./../models/materielModel');
const User = require('../models/userModel');

// Create a reservation for a material
router.post('/', async (req, res) => {
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
  endDateTime: { $gt: startDate }
});

if (existingReservation && material.quantityAvailable === 0) {
  return res.status(409).json({ message: 'Material already reserved for the given time range' });
}



    // Create the reservation
    const reservation = await Reservation.create({
      reservationId: 'reservation_' + Date.now(), // Generate a unique reservation ID
      material: materialId,
      startDateTime: startDate,
      endDateTime: endDate
    });

    // Update the quantityAvailable of the material
    material.quantityAvailable -= 1;
    await material.save();

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
