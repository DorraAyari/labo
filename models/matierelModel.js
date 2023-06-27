const mongoose = require('mongoose');

const materielSchema = mongoose.Schema(
  {
    uniqueArticleId: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    specifications: {
      type: String
    },
    quantityAvailable: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Materiel = mongoose.model('Materiel', materielSchema);

module.exports = Materiel;
