const mongoose = require('mongoose');

const laboSchema = mongoose.Schema(
  {
    labId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Labo = mongoose.model('Labo', laboSchema);

module.exports = Labo;
