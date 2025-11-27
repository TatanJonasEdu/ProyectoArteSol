const express = require('express');
const router = express.Router();

// Base de datos falsa de capitales (tiempo en días hábiles)
const costosCapitales = new Map();
costosCapitales.set('bogota', { costo: 8500, tiempo: 2 });
costosCapitales.set('medellin', { costo: 12500, tiempo: 3 });
costosCapitales.set('cali', { costo: 13000, tiempo: 3 });
costosCapitales.set('barranquilla', { costo: 14000, tiempo: 4 });
costosCapitales.set('cartagena', { costo: 14500, tiempo: 4 });
costosCapitales.set('bucaramanga', { costo: 11000, tiempo: 3 });
costosCapitales.set('ibague', { costo: 10000, tiempo: 3 });
costosCapitales.set('pereira', { costo: 12000, tiempo: 3 });
costosCapitales.set('manizales', { costo: 12000, tiempo: 3 });
costosCapitales.set('armenia', { costo: 12000, tiempo: 3 });
costosCapitales.set('cucuta', { costo: 15000, tiempo: 4 });
costosCapitales.set('pasto', { costo: 18000, tiempo: 5 });
costosCapitales.set('villavicencio', { costo: 9000, tiempo: 3 });
costosCapitales.set('santa marta', { costo: 14500, tiempo: 4 });
costosCapitales.set('monteria', { costo: 14000, tiempo: 4 });

/**
 * Yo normalizo texto: "Bogotá D.C." -> "bogota dc"
 */
function normalizarTexto(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/**
 * Yo cotizo el envío según la ciudad
 * POST /api/envio/cotizar
 */
router.post('/cotizar', (req, res) => {
    try {
        const { ciudad } = req.body;
        if (!ciudad) {
            return res.status(400).json({ msg: 'La ciudad es requerida.' });
        }

        const ciudadNormalizada = normalizarTexto(ciudad);

        let costoEnvio;
        let tiempoDias;

        if (costosCapitales.has(ciudadNormalizada)) {
            const data = costosCapitales.get(ciudadNormalizada);
            costoEnvio = data.costo;
            tiempoDias = data.tiempo;
            console.log(`[Cotización] Capital: ${ciudad}`);

        } else {
            console.log(`[Cotización] Municipio: ${ciudad}`);

            // Yo simulo costo basado en hash del nombre
            let hash = 0;
            for (let i = 0; i < ciudadNormalizada.length; i++) {
                hash += ciudadNormalizada.charCodeAt(i);
            }
            
            costoEnvio = 14000 + (hash % 11000); 
            costoEnvio = Math.round(costoEnvio / 100) * 100;
            tiempoDias = 4 + (hash % 5);
        }

        const tiempoEntrega = `${tiempoDias} a ${tiempoDias + 2} días hábiles`;

        setTimeout(() => {
            res.status(200).json({ 
                ciudad: ciudad,
                costoEnvio: costoEnvio,
                tiempoEntrega: tiempoEntrega
            });
        }, 750);

    } catch (error) {
        res.status(500).json({ msg: 'Error al cotizar el envío.' });
    }
});

/**
 * Yo genero la guía de envío
 * POST /api/envio/generar
 */
router.post('/generar', (req, res) => {
    try {
        const { cliente, carrito, costoEnvio, tiempoEntrega } = req.body;
        
        if (!cliente || !carrito || carrito.length === 0 || !costoEnvio || !tiempoEntrega) {
            return res.status(400).json({ msg: 'Faltan datos para generar la guía.' });
        }

        console.log('--- [Nuevo Pedido] ---');
        console.log('Cliente:', cliente.nombre);
        console.log('Dirección:', cliente.direccion, cliente.ciudad);
        console.log('Envío:', `$${costoEnvio} (${tiempoEntrega})`);
        console.log('Productos:', carrito.map(p => `${p.nombre} (x${p.cantidad})`).join(', '));

        // Yo genero número de guía
        const numeroGuia = `ARTESOL-${Date.now().toString().slice(-6)}`;

        setTimeout(() => {
            res.status(201).json({ 
                exito: true, 
                guia: numeroGuia,
                mensaje: 'Pedido creado exitosamente' 
            });
        }, 1500);

    } catch (error) {
        res.status(500).json({ msg: 'Error al generar la guía.' });
    }
});

module.exports = router;