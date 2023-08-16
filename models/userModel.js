const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },labid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Laboratoire",
    },
    role: {
      type: String,
      enum: ["responsable", "enseignant", "etudiant"],
      default: "etudiant",
    },

    reservations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
