const mongoose = require('mongoose');

const reservationSchema = mongoose.Schema(
  {
    reservationId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
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

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
