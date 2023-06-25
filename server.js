const express = require('express')
const mongoose = require('mongoose');
const User = require('./models/userModel')

const app = express()
app.use(express.json())
 //routes
app.get('/',  (req,res) => {
    res.send('Hello Node api')
})

app.get('/labo',  (req,res) => {
    res.send('Hello labo')
})
app.get('/user', async(req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})
app.post('/user', async(req, res) => {
    try {
        const user = await User.create(req.body)
        res.status(200).json(user);
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message})
    }
})
app.get('/user/:id', async(req, res) =>{
    try {
        const {id} = req.params;
        const user = await User.findById(id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})
app.listen(8000, ()=> {
    console.log('Node Api is running on port 3000')
})
mongoose.set("strictQuery",false)
mongoose.
connect('mongodb+srv://labo:root@cluster0.pqbr7eg.mongodb.net/Node=API?retryWrites=true&w=majority')
.then( () => {
    console.log('connect to database')

}).catch((error) => {
         console.log('error')
    }) 