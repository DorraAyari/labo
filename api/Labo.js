const express = require('express');
const router = express.Router();
const Labo = require('./../models/laboModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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
  
// GET - Récupérer tous les labos
router.get('/', authenticateUser, async (req, res) => {
  try {
    const labos = await Labo.find({});
    res.status(200).json(labos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Récupérer un labo spécifique
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid labo ID' });
    }
    const labo = await Labo.findById(id);
    if (!labo) {
      return res.status(404).json({ message: 'Labo not found' });
    }
    res.status(200).json(labo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST - Créer un nouveau labo
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { labId, name, location } = req.body;
    const labo = await Labo.create({
      labId,
      name,
      location
    });
    res.status(201).json(labo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT - Modifier un labo existant
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid labo ID' });
    }
    const labo = await Labo.findByIdAndUpdate(
      id,
      { name, location },
      { new: true }
    );
    if (!labo) {
      return res.status(404).json({ message: 'Labo not found' });
    }
    res.status(200).json(labo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Supprimer un labo
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid labo ID' });
    }
    const labo = await Labo.findByIdAndDelete(id);
    if (!labo) {
      return res.status(404).json({ message: 'Labo not found' });
    }
    res.status(200).json({ message: 'Labo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
