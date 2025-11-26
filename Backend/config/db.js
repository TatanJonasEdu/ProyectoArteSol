//db.js

const mongoose = require('mongoose');
require('dotenv').config();

//configurara la conecion con mongodb
const conectarBD = () =>{
mongoose
    .connect(process.env.DB_MONGO)
    .then(() => console.log("estamos conectados con mongo"))
    .catch((err) => console.err(err))
}

module.exports= conectarBD;