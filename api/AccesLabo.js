const express = require("express");
const router = express.Router();
const Laboratoire = require("./../models/laboratoireModel");
const User = require("./../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  //console.log("Token:", token); // Check the token value in the console

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

router.post("/", authenticateUser, async (req, res) => {
  try {
    const { labId, name, bloc, salle, disponibilite, etat, image } = req.body;

    // Créer la réservation de laboratoire
    const laboratoire = await Laboratoire.create({
      labId,
      name,
      bloc,
      salle,
      disponibilite,
      etat,
      image,
      status: "pending",
      user: req.user.userId, // Assign the user ID from the authenticated user

    });
    res
      .status(201)
      .json({
        message: "Laboratory reservation created",
        reservationId: laboratoire._id,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", authenticateUser, async (req, res) => {
  try {
    // Récupérer toutes les réservations de laboratoire
    const reservations = await Laboratoire.find();

    res.json({ reservations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/:reservationId", authenticateUser, async (req, res) => {
  try {
    const { reservationId } = req.params;

    // Récupérer la réservation de laboratoire par son identifiant
    const reservation = await Laboratoire.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.json({ reservation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:reservationId", authenticateUser, async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { action } = req.body;

    // Récupérer la réservation de laboratoire à approuver/rejeter
    const laboratoire = await Laboratoire.findById(reservationId);
    if (!laboratoire) {
      return res
        .status(404)
        .json({ message: "Laboratory reservation not found" });
    }

    // Vérifier si la réservation est déjà approuvée ou rejetée
    if (laboratoire.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Laboratory reservation already processed" });
    }

    // Vérifier si l'utilisateur connecté est le responsable de la réservation
    if (req.user.role !== "responsable") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }

    // Mettre à jour le statut de la réservation en fonction de l'action
    if (action === "approve") {
      laboratoire.status = "approved";
    } else if (action === "reject") {
      laboratoire.status = "rejected";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    // Sauvegarder la réservation mise à jour
    await laboratoire.save();

    // Envoyer un e-mail à l'utilisateur concernant le statut de la réservation
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
      subject: "Laboratory Reservation Status",
      text: `Your laboratory reservation with ID ${reservationId} has been ${laboratoire.status}.`,
    };
console.log(mailOptions);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending email" });
      } else {
        console.log("Email sent:", info.response);
        // Pas de réponse nécessaire ici, car la réponse a déjà été envoyée avant ce rappel.
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
