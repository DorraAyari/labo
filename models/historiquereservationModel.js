const mongoose = require('mongoose');

const historiquereservationSchema = mongoose.Schema(
  {
    reservationId: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: String,
      required: true
    },
    articleId: {
      type: String,
      required: true
    },
    startDateTime: {
      type: Date,
      required: true
    },
    reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
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

const HistoriqueReservation = mongoose.model('HistoriqueReservation', historiquereservationSchema);

module.exports = HistoriqueReservation;
