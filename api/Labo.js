
const express = require('express');
const router = express.Router();
const Labo = require('../models/laboModel');
const mongoose = require('mongoose');


router.get('/labo',  (req,res) => {
    res.send('Hello labo')
})
module.exports = router;
