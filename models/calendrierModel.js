const mongoose = require('mongoose');

const calendrierSchema = mongoose.Schema(
  {
    reservationId: {
      type: String,
      required: true,
      unique: true
    },
    articleId: {
      type: String,
      required: true
    },
    userId: {
      type: String,
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
