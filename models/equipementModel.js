const mongoose = require('mongoose');

const equipementSchema = mongoose.Schema(
  {
    nom: {
      type: String,
    //  required: true
    },
    ref: {
      type: String,
    //  required: true
    unique: true
    },
    image: {
      type: Array
    },
    labo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratoire',
    //  required: true
  },
    caracteristique: {
      type: Map,
      of: String
    },
    marque: {
      type: String
    },
    model: {
      type: String
    },
    dateCreation: {
      type: Date,
      default: Date.now
    },
    dateDernierModif: {
      type: Date,
      default: Date.now
    },
    quantityAvailable: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
    //  required: true
  }
  },
  {
    timestamps: true
  }
);

const Equipement = mongoose.model('Equipement', equipementSchema);

module.exports = Equipement;
