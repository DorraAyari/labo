const mongoose = require('mongoose');

const stockSchema = mongoose.Schema(
  {
    articleId: {
      type: String,
      required: true,
      unique: true
    },
    quantityAvailable: {
      type: Number,
      default: 0
    },
    quantityReserved: {
      type: Number,
      default: 0
    },
    lastUpdateDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
