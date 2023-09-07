const express = require("express");
const cors = require('cors');
const User = require("../models/userModel");
const app = express();
const reservationlabo = require('./../models/calendrierModel');
const equipement = require('./../models/equipementModel');
const reservationequipement = require('./../models/reservationModel');

app.use(cors());




const router = express.Router();
const Labo = require("../models/laboratoireModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
const fs = require("fs"); // Add this import to use the fs module


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../assets")); // Spécifiez le chemin absolu du dossier de destination des images
  },
  filename: (req, file, cb) => {
    //console.log(file);
    cb(null, Date.now() + path.extname(file.originalname)); // Générer un nom de fichier unique avec un horodatage
  },
});

// Middleware to verify the JWT token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Authorization token not provided" });
  }

  // Verify the token
  jwt.verify(token, "your-secret-key", (err, decoded) => {
    req.user = decoded; // Set the decoded user information in the request object
    next();
  });
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit (adjust as needed)
});

// ... Other routes ...

router.post("/", authenticateUser, upload.array("image"), async (req, res) => {
  try {
    const images = req.files; // Use upload.array() to get an array of uploaded files
    //console.log("Images:", images);

    // Check if images are present and not null
    if (!images || images.length === 0 || images.some((image) => !image)) {
   //   console.log("No images uploaded");
      return res.status(400).json({ message: "No valid image uploaded" });
    }

   // console.log("Number of Uploaded Files:", images.length);

    const {
      name,
      bloc,
      salle,
      disponibilite,
    } = req.body;
    // Create the labo object with the image field set to the filename
    const labo = await Labo.create({
      labId: "labId" + Date.now(),
      name,
      bloc,
      salle,
      disponibilite,
      responsable: null,
      image: images.map((image) => image.filename),
    });


    res.status(201).json({ message: "success", labo });
  } catch (error) {
    console.error("Error in POST /lab:", error);
    res.status(500).json({ message: error.message });
  }
});



// READ - Get a specific labo
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid labo ID" });
    }
    const labo = await Labo.findById(id);
    if (!labo) {
      return res.status(404).json({ message: "Labo not found" });
    }
    res.status(200).json(labo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// READ - Get all labos
router.get("/", authenticateUser, async (req, res) => {
  try {
    const labos = await Labo.find({});

    const send = []; // Le nouveau tableau 'send'

    for (const item of labos) {
      let sendItem = {
        _id: item._id,
        labId: item.labId,
        name: item.name,
        bloc: item.bloc,
        salle: item.salle,
        disponibilite: item.disponibilite,
        image: item.image,
        status: item.status,
      };

      if (item.responsable === null) {
        sendItem.responsable = ""; // Set to an empty string if responsable is null
      } else {
        const iduser = item.responsable.toHexString();
        const username = await User.findById(iduser);

        if (username) {
          sendItem.responsable = username.name;
        } else {
          sendItem.responsable = ""; // Set to an empty string if username is not found
        }
      }

      send.push(sendItem); // Ajouter l'objet dans le tableau 'send'
    }

    console.log(send);
    res.status(200).json(send);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Update an existing labo
router.put("/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { disponibilite } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid labo ID" });
    }

    // Recherchez le laboratoire par ID
    const labo = await Labo.findById(id);

    if (!labo) {
      return res.status(404).json({ message: "Labo not found" });
    }

    // Vérifiez si le laboratoire a un responsable si la disponibilité est vraie
    if (disponibilite === true && !labo.responsable) {
      return res.status(400).json({ message: "Vous devez affecter un responsable si vous souhaitez que le  laboratoire soit disponible." });
    }

    // Mettez à jour la disponibilité si tout est correct
    const updatedLabo = await Labo.findByIdAndUpdate(
      id,
      { disponibilite },
      { new: true }
    );

    res.status(200).json(updatedLabo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/findByResponsable/:responsableId", authenticateUser, async (req, res) => {
  try {
    const { responsableId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(responsableId)) {
      return res.status(400).json({ message: "Invalid responsable ID" });
    }
    const labos = await Labo.find({ responsable: responsableId });


    res.status(200).json(labos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Update responsable 
router.put("/responsable/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { responsable } = req.body; // On extrait uniquement le champ "responsable" du corps de la requête

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid labo ID" });
    }

    const labo = await Labo.findByIdAndUpdate(
      id,
      { responsable }, // Mise à jour du champ "responsable" uniquement
      { new: true }
    );

    if (!labo) {
      return res.status(404).json({ message: "Labo not found" });
    }
    res.status(200).json(labo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// DELETE - Delete a labo

router.delete("/:id", authenticateUser, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid labo ID" });
    }

    // Supprimez le labo par ID
    const labo = await Labo.findByIdAndDelete(id);

    if (!labo) {
      return res.status(404).json({ message: "Labo not found" });
    }

    // Supprimez les quipements associés au labo
    await reservationlabo.deleteMany({ labo:id });

    // Supprimez les réservations associées au labo
    await equipement.deleteMany({ labo:id });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Labo deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
});

// Export the router
module.exports = router;
