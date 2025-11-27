// Importo dependencias
const express = require('express');
const conectarBD = require('../config/db');
const cors = require('cors');
const path = require('path');

// Creo la app y defino el puerto
const app = express();
const port = process.env.PORT || 5000;

// Conecto la base de datos
conectarBD();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, '../img', 'frontend')));

// Configuro CORS (para desarrollo permito cualquier origen)
app.use(cors({
    origin: '*', // En producción pongo mi dominio
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Registro rutas de la API
app.use('/api/productos', require('../routes/rutasProductos'));
app.use('/api/blog', require('../routes/rutasBlog'));
app.use('/api/contacto', require('../routes/rutasContacto'));
app.use('/api/resenas', require('../routes/rutasResenas'));
app.use('/api/envio', require('../routes/rutasEnvio'));

// Ruta raíz para verificación rápida
app.get('/', (req, res) => {
    res.send('hola estamos conectados desde la web');
});

// Inicio el servidor en desarrollo
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`El servidor está conectado http://localhost:${port}`);
    });
}

// Exporto la app (necesario para despliegue en plataformas como Vercel)
module.exports = app;