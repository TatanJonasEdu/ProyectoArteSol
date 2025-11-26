//index.js
const express = require('express');
const conectarBD = require('../config/db')
const cors = require('cors');
const path = require('path');


//creamos la variable app
const app = express();
const port = process.env.PORT || 5000;

//conexion bases de datos
conectarBD();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../img', 'frontend')));

//ruta para consumir la api cliente


app.use('/api/productos', require('../routes/rutasProductos'));
app.use('/api/blog', require('../routes/rutasBlog'));
app.use('/api/contacto', require('../routes/rutasContacto'));
app.use('/api/resenas', require('../routes/rutasResenas'));
app.use('/api/envio', require('../routes/rutasEnvio'));




//ruta para verificar nuestro servidor en la web
app.get('/', (req,res) =>{
    res.send('hola estamos conectados desde la web')
});


// Modificación para Vercel:
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`El servidor está conectado http://localhost:${port}`);
    });
}

module.exports = app; // ¡Esto es lo más importante!