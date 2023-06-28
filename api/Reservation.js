const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservationModel');

router.post('/reservation', async (req, res) => {
  try {
    const reservation = await Reservation.create(req.body);
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
