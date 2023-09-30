const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./api/User");
const userCrud = require("./api/UserCrud");
const laboRouter = require("./api/Laboratoire");
const materielRouter = require("./api/Equipement");
const reservationRouter = require("./api/Reservation");
const calendrierRouter = require("./api/Calendrier");
const accesRouter = require("./api/AccesLabo");
const calendarRouter = require("./api/CalendarLab");
const User = require("./models/userModel");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use("/", userRouter); 
app.use("/user", userCrud);
app.use("/reservation", reservationRouter);
app.use("/laboratoire", laboRouter);
app.use("/equipement", materielRouter);
app.use("/calendrier", calendrierRouter);
app.use("/acces", accesRouter);
app.use("/events", calendarRouter);
const path = require("path");
app.use("/assets", express.static(path.join(__dirname, "assets")));


app.get("/", (req, res) => {
  res.send("Hello Node API");
});

// ... Other code ...

const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://rayen:rayen@cluster0.qjsmetb.mongodb.net/?retryWrites=true&w=majority"
    );


    const adminUser = await User.findOne({ name: "admin", role: "responsable" });

    if (!adminUser) {
      const passwordForDefaultAdmin = "admin"; // Remplacez par le mot de passe souhaité
  const hashedPasswordForDefaultAdmin = await bcrypt.hash(passwordForDefaultAdmin, saltRounds);

      // Si l'utilisateur "admin" n'existe pas, le créer par défaut
      const defaultAdmin = new User({
        name: "admin",
        lastname: "admin",
        email: "admin", // Remplacez par l'email souhaité
        password: hashedPasswordForDefaultAdmin, // Remplacez par le mot de passe souhaité
        dateOfBirth: new Date(),
        role: "responsable",
      });
  
      await defaultAdmin.save();
      console.log("Default admin user created");
    }
    console.log("Connected to the database");
  } catch (error) {
    console.log("Error connecting to the database:", error);
  }
};

connectToDatabase();

app.listen(8000, () => {
  console.log("Node API is running on port 8000");
});

