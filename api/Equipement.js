const express = require("express");
const cors = require('cors');

const app = express();
app.use(cors());

const router = express.Router();
const Equipement = require("../models/equipementModel");
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
const fs = require("fs"); // Add this import to use the fs module

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../assets")); // Spécifiez le chemin absolu du dossier de destination des images
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname)); // Générer un nom de fichier unique avec un horodatage
  },
});

// Middleware to verify the JWT token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Authorization token not provided" });
  }

  // Verify the token
  jwt.verify(token, "your-secret-key", (err, decoded) => {
    req.user = decoded; // Set the decoded user information in the request object
    next();
  });
};
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit (adjust as needed)
});
// CREATE - Create a new equipement with image upload
router.post("/", authenticateUser, upload.array("image"), async (req, res) => {
  try {
    const images = req.files; // Use upload.array() to get an array of uploaded files
    console.log("Images:", images);

    // Check if images are present and not null
    if (!images || images.length === 0 || images.some((image) => !image)) {
      console.log("No images uploaded");
      return res.status(400).json({ message: "No valid image uploaded" });
    }

    console.log("Number of Uploaded Files:", images.length);
    const {
      nom,
      ref,
      labo,
      caracteristique,
      marque,
      model,
      dateCreation,
      dateDernierModif,
      quantityAvailable,
      description,
    } = req.body;

    const equipement = await Equipement.create({
      nom,
      ref,
      image: images.map((image) => image.filename),
      labo,
      caracteristique,
      marque,
      model,
      dateCreation,
      dateDernierModif,
      quantityAvailable,
      description,
    });
    res.status(201).json(equipement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE - Update an existing equipement with image upload
router.put("/:id", authenticateUser, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom,
      ref,
      labo,
      caracteristique,
      marque,
      model,
      dateCreation,
      dateDernierModif,
      quantityAvailable,
      description,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid equipement ID" });
    }

    const equipement = await Equipement.findByIdAndUpdate(
      id,
      {
        nom,
        ref,
        image: req.file ? req.file.filename : undefined,
        labo,
        caracteristique,
        marque,
        model,
        dateCreation,
        dateDernierModif,
        quantityAvailable,
        description,
      },
      { new: true }
    );

    if (!equipement) {
      return res.status(404).json({ message: "Equipement not found" });
    }

    res.status(200).json(equipement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// READ - Get all equipements
router.get("/", authenticateUser, async (req, res) => {
  try {
    const equipements = await Equipement.find({});
    res.status(200).json(equipements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ - Get a specific equipement
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid equipement ID" });
    }
    const equipement = await Equipement.findById(id);
    if (!equipement) {
      return res.status(404).json({ message: "Equipement not found" });
    }
    res.status(200).json(equipement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/lab/:id',authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid equipement ID' });
    }
    const equipements = await Equipement.find({ labo: id });
    console.log(equipements);
    if (!equipements) {
      return res.status(404).json({ message: 'Equipement not found' });
    }
    res.status(200).json(equipements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Update an existing equipement
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom,
      ref,
      image,
      labo,
      caracteristique,
      marque,
      model,
      dateCreation,
      dateDernierModif,
      quantityAvailable,
      description,
    } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid equipement ID" });
    }
    const equipement = await Equipement.findByIdAndUpdate(
      id,
      {
        nom,
        ref,
        image,
        labo,
        caracteristique,
        marque,
        model,
        dateCreation,
        dateDernierModif,
        quantityAvailable,
        description,
      },
      { new: true }
    );
    if (!equipement) {
      return res.status(404).json({ message: "Equipement not found" });
    }
    res.status(200).json(equipement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Delete an equipement
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid equipement ID" });
    }
    const equipement = await Equipement.findByIdAndDelete(id);
    if (!equipement) {
      return res.status(404).json({ message: "Equipement not found" });
    }
    res.status(200).json({ message: "Equipement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export the router
module.exports = router;
