//rutasContacto.js
const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contacto.controller');

// Ruta para enviar un nuevo mensaje de contacto
// POST -> http://localhost:5000/api/contacto
router.post('/', contactoController.enviarMensaje);

// Ruta para obtener todos los mensajes de contacto (solo admin)
// GET -> http://localhost:5000/api/contacto
router.get('/', contactoController.obtenerMensajes);

module.exports = router;