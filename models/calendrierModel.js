const mongoose = require('mongoose');

const calendrierSchema = mongoose.Schema(
  {
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true
    },
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startDateTime: {
      type: Date,
      required: true
    },
    endDateTime: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Calendrier = mongoose.model('Calendrier', calendrierSchema);

module.exports = Calendrier;
