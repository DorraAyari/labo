const express = require("express");
const router = express.Router();
const Reservation = require("./../models/reservationModel");
const Material = require("../models/equipementModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");

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
        remis:false,
        user: req.user.userId, // Assign the user ID from the authenticated user
        status: "pending", // Set the initial status as "pending"
      });
      res.status(201).json({ reservationId: reservation._id });

      // Update the quantityAvailable of the material
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


/*
router.get("/material/:reservationId", authenticateUser, async (req, res) => {
  try {
    const { reservationId } = req.params;

    // Fetch all reservations
    const reservations = await Reservation.find({ material: reservationId });
console.log(reservations)
    res.status(200).json({ reservations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/
router.get("/material/:reservationId", authenticateUser, async (req, res) => {
  try {
    const { reservationId } = req.params;

    // Fetch all reservations
    const reservations = await Reservation.find({ material: reservationId });
const send = []; // Le nouveau tableau 'send'

for (const item of reservations) {
const username = await User.findById(item.user);
console.log(item.remis)

const sendItem ={
  _id: item._id,
  reservationId: item.reservationId,
  user: username.email,
  material: item.material,
  startDateTime: item.startDateTime,
  endDateTime: item.endDateTime,
  status: item.status,
  remis: item.remis,

  createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    __v: item.__v
 
}
console.log(sendItem)
send.push(sendItem);

}

    res.status(200).json({"reservations": send});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }


  
});

router.get("/user/:Id", authenticateUser, async (req, res) => {
  try {
    const { Id } = req.params;

    // Fetch all reservations
    const reservations = await Reservation.find({
      user
        : Id
    });

    const send = []; // Le nouveau tableau 'send'

for (const item of reservations) {
const username = await User.findById(item.user);
const material = await Material.findById(item.material);
console.log(material)

const sendItem ={
  _id: item._id,
  reservationId: material.nom,
  user: username.email,
  material: material.image,
  startDateTime: item.startDateTime,
  endDateTime: item.endDateTime,
  status: item.status,
  createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    __v: item.__v,
    remis: item.remis,

 
}
send.push(sendItem);

}

console.log("seeeenddd"+send)
    res.status(200).json({"reservations": send});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }


  
});
router.get("/", authenticateUser, async (req, res) => {
  try {
    // Fetch all reservations
    const reservations = await Reservation.find();

    res.status(200).json({ reservations });
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
    /* if (req.user.role !== "responsable") {
       return res
         .status(403)
         .json({ message: "You are not authorized to perform this action" });
     }*/
    // Check if the reservation is already approved or rejected
    if (reservation.status !== "pending") {
      return res.status(400).json({ message: "Reservation already processed" });
    }

    // Update the reservation status based on the action
    if (action === "approve") {
      reservation.status = "approved";
      reservation.quantityAvailable -= 1;

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


  
});



router.put("/remis/:reservationId", authenticateUser, async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { action } = req.body;

    // Fetch the reservation to be approved/rejected
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    // Vérifier si l'utilisateur connecté est le responsable de la réservation
    /* if (req.user.role !== "responsable") {
       return res
         .status(403)
         .json({ message: "You are not authorized to perform this action" });
     }*/
    // Check if the reservation is already approved or rejected
    if (action === true) {
      console.log(reservation.material)
      
      const mat = await Material.findById(reservation.material);

if (mat) {
  reservation.remis = true;
  mat.quantityAvailable += 1;
  await mat.save();
} else {
  console.log("Document Material introuvable");
}

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
    res.status(200).json({ message: true });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






module.exports = router;
