const express = require('express');
const app = express();
const router = express.Router();
const Laboratoire = require('./../models/laboratoireModel');
const nodemailer = require("nodemailer");

const jwt = require("jsonwebtoken");

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

// Create an event
router.post('/', authenticateUser,async (req, res) => {
  try {
    const { labId, name, bloc, salle, startTime, endTime } = req.body;

    // Check if the lab exists
    const lab = await Laboratoire.findById(labId);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    // Check if an event already exists for the given date
    const existingEvent = lab.events.find((event) =>
      isSameDate(event.startTime, new Date(startTime))
    );
    if (existingEvent) {
      return res.status(409).json({ message: 'Event already exists for the given date' });
    }

    // Initialize the events array if it's undefined
    lab.events = lab.events || [];

    // Create the event
    const event = {
      _id: generateEventId(), // Generate a unique event ID
      name,
      bloc,
      salle,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'pending',
    };

    // Add the event to the lab's events array
    lab.events.push(event);
    await lab.save();

    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to check if two dates have the same day, month, and year
function isSameDate(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Helper function to generate a unique event ID
function generateEventId() {
  return 'event_' + Date.now();
}

// Get all events
router.get('/',authenticateUser, async (req, res) => {
  try {
    // Fetch all labs with events
    const labs = await Laboratoire.find({ events: { $exists: true, $ne: [] } });

    // Flatten the events array and return all events
    const events = labs.reduce((accumulator, lab) => {
      accumulator.push(...lab.events);
      return accumulator;
    }, []);

    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
////////////////////////////////////
// Update the status of an event (approve or reject)
// Update the status of an event (approve or reject)
router.put('/:eventId',authenticateUser, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { action } = req.body;

    // Find the lab containing the event
    const lab = await Laboratoire.findOne({ 'events._id': eventId });
    if (!lab) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Find the event and update its status
    const event = lab.events.find((event) => event._id.toString() === eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update the reservation status based on the action
    if (action === 'approve' && event.status === 'pending') {
      event.status = 'approved';
    } else if (action === 'reject' && event.status === 'pending') {
      event.status = 'rejected';
    } else {
      return res.status(400).json({ message: 'Invalid action or event has already been processed' });
    }

    await lab.save();

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
      subject: "Reservation labo Status",
      text: `Your reservation labo with ID ${event._id} has been ${event.status}.`,
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
  



    // Define color based on event status
    let color;
    switch (event.status) {
      case 'pending':
        color = 'yellow';
        break;
      case 'approved':
        color = 'green';
        break;
      case 'rejected':
        color = 'red';
        break;
      default:
        color = 'gray';
        break;
    }

    res.json({ event, color });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
