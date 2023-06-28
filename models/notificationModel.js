const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
    content: {
      type: String,
      required: true
    },
    sendDateTime: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
