const express = require('express');
const router = express.Router();
const Calendrier = require('./../models/calendrierModel');
const mongoose = require('mongoose');

// Endpoint pour créer une réservation
router.post('/', async (req, res) => {
    try {
      const { materialId, userId, startDateTime, endDateTime ,reservationId} = req.body;


      let validReservationId = reservationId;

      // If reservationId is not provided, generate a new ObjectId
      if (!validReservationId || !mongoose.Types.ObjectId.isValid(validReservationId)) {
        validReservationId = new mongoose.Types.ObjectId();
      }
      // Créer un nouvel événement dans le calendrier
      const event = await Calendrier.create({
        reservation: validReservationId,
        material: materialId,
        user: userId,
        startDateTime,
        endDateTime
      });

      res.status(201).json({ event });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Endpoint pour récupérer toutes les réservations
router.get('/', async (req, res) => {
  try {
    // Récupérer tous les événements du calendrier
    const events = await Calendrier.find();

    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour mettre à jour une réservation
router.put('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { startDateTime, endDateTime } = req.body;

    // Mettre à jour l'événement dans le calendrier
    const event = await Calendrier.findByIdAndUpdate(eventId, {
      startDateTime,
      endDateTim
    }, { new: true });

    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour supprimer une réservation
router.delete('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Supprimer l'événement du calendrier
    const event = await Calendrier.findByIdAndDelete(eventId);

    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
