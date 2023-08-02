const mongoose = require("mongoose");

const LaboratoireSchema = mongoose.Schema(
  {
    labId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
     required: true,
    },
    bloc: {
      type: String,
     required: true,
    },
    salle: {
      type: String,
     required: true,
    },
    disponibilite: {
      type: Boolean,
     required: true,
    },
    etat: {
      type: String,
     required: true,
    },
    image: {
      type: [String], // An array of strings (filenames)
      required: true, // The image field is required
    },
    responsable: {
      type: String,
     required: true,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
 /*   events: [
      {
        _id: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        bloc: {
          type: String,
          required: true,
        },
        salle: {
          type: String,
          required: true,
        },
        startTime: {
          type: Date,
          required: true,
        },
        endTime: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
      },
    ],*/
  
  },
  {
    timestamps: true,
  }
);

const Laboratoire = mongoose.model("Laboratoire", LaboratoireSchema);

module.exports = Laboratoire;
