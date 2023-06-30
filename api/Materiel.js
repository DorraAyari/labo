const express = require('express');
const router = express.Router();
const Materiel = require('./../models/materielModel');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');

// Middleware to verify the JWT token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Authorization token not provided' });
  }

  // Verify the token
  jwt.verify(token, 'your-secret-key', (err, decoded) => {
   

    req.user = decoded; // Set the decoded user information in the request object
    next();
  });
};

// Get all materials
router.get('/', authenticateUser, async (req, res) => {
  try {
    const materials = await Materiel.find({});
    res.status(200).json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a material by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid material ID' });
    }
    const material = await Materiel.findById(id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(200).json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new material
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { uniqueArticleId, description, specifications, quantityAvailable, labo, stock } = req.body;
    const material = await Materiel.create({
      uniqueArticleId,
      description,
      specifications,
      quantityAvailable,
      labo,
      stock,
    });
    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a material
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { uniqueArticleId, description, specifications, quantityAvailable, labo, stock } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid material ID' });
    }
    const material = await Materiel.findByIdAndUpdate(
      id,
      {
        uniqueArticleId,
        description,
        specifications,
        quantityAvailable,
        labo,
        stock,
      },
      { new: true }
    );
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(200).json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a material
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid material ID' });
    }
    const material = await Materiel.findByIdAndDelete(id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    res.status(200).json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
