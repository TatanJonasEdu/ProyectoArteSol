const express = require('express');
const router = express.Router();
const contactoController = require('../controllers/contacto.controller');

// Yo envío un nuevo mensaje de contacto
router.post('/', contactoController.enviarMensaje);

// Yo obtengo todos los mensajes de contacto
router.get('/', contactoController.obtenerMensajes);

module.exports = router;