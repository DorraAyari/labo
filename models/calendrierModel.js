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
// ... Autres parties de votre modèle

// Méthode statique pour récupérer tous les événements du calendrier
calendrierSchema.statics.getAllEvents = async function () {
  try {
    const events = await this.find();
    return events;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des événements');
  }
};

// Méthode statique pour mettre à jour un événement dans le calendrier
calendrierSchema.statics.updateEvent = async function (eventId, eventData) {
  try {
    const updatedEvent = await this.findByIdAndUpdate(eventId, eventData, { new: true });
    return updatedEvent;
  } catch (error) {
    throw new Error('Erreur lors de la mise à jour de l\'événement');
  }
};

// Méthode statique pour supprimer un événement du calendrier
calendrierSchema.statics.deleteEvent = async function (eventId) {
  try {
    const deletedEvent = await this.findByIdAndDelete(eventId);
    return deletedEvent;
  } catch (error) {
    throw new Error('Erreur lors de la suppression de l\'événement');
  }
};


calendrierSchema.statics.createEvent = async function (eventData) {
  try {
    const event = new Calendrier(eventData);
    await event.save();
    return event;
  } catch (error) {
    throw new Error('Erreur lors de la création de l\'événement');
  }
};

const Calendrier = mongoose.model('Calendrier', calendrierSchema);

module.exports = Calendrier;
