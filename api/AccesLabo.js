const express = require('express');
const router = express.Router();
const Laboratoire = require('./../models/laboratoireModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  console.log('Token:', token); // Vérifiez la valeur du jeton dans la console

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token not provided' });
  }

  const tokenValue = token.split(' ')[1]; // Extrait la valeur du jeton sans le préfixe
  jwt.verify(tokenValue, 'your-secret-key', (err, decoded) => {
    console.log('Decoded:', decoded); // Vérifiez l'objet décodé dans la console

    req.user = decoded; // Définir les informations de l'utilisateur décodé dans l'objet de requête
    next();
  });
};

router.post('/', authenticateUser, async (req, res) => {
  try {
    const { labId, name, bloc, salle, disponibilite, etat, image, responsable } = req.body;

    // Créer la réservation de laboratoire
    const laboratoire = await Laboratoire.create({
      labId,
      name,
      bloc,
      salle,
      disponibilite,
      etat,
      image,
      responsable,
      status: 'pending', // Définir le statut de la réservation sur "pending"
    });

    res.status(201).json({ message: 'Laboratory reservation created', reservationId: laboratoire._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', authenticateUser, async (req, res) => {
  try {
    // Récupérer toutes les réservations de laboratoire
    const reservations = await Laboratoire.find();

    res.json({ reservations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { action } = req.body;

    // Récupérer la réservation de laboratoire à approuver/rejeter
    const laboratoire = await Laboratoire.findById(reservationId);
    if (!laboratoire) {
      return res.status(404).json({ message: 'Laboratory reservation not found' });
    }

    // Vérifier si la réservation est déjà approuvée ou rejetée
    if (laboratoire.status !== 'pending') {
      return res.status(400).json({ message: 'Laboratory reservation already processed' });
    }

    // Mettre à jour le statut de la réservation en fonction de l'action
    if (action === 'approve') {
      laboratoire.status = 'approved';
    } else if (action === 'reject') {
      laboratoire.status = 'rejected';
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // Sauvegarder la réservation mise à jour
    await laboratoire.save();

    // Envoyer un e-mail à l'utilisateur concernant le statut de la réservation
    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: 'fd50e9e045b5e0',
        pass: '0cb81a727eab0c',
      },
    });

    const mailOptions = {
      from: 'dorra.ayari@esprit.tn',
      to: 'dorra.ayari@esprit.tn',
      subject: 'Laboratory Reservation Status',
      text: `Your laboratory reservation with ID ${reservationId} has been ${laboratoire.status}.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending email' });
      } else {
        console.log('Email sent:', info.response);
        // Pas de réponse nécessaire ici, car la réponse a déjà été envoyée avant ce rappel.
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
