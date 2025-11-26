//rutasEnvio.js
const express = require('express');
const router = express.Router();

// --- 1. BASE DE DATOS FALSA DE CAPITALES ---
// (tiempo en días hábiles)
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
 * Función para normalizar texto:
 * "Bogotá D.C." -> "bogota dc"
 */
function normalizarTexto(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .normalize("NFD") // Quita acentos
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/**
 * RUTA FALSA DE COTIZACIÓN DE ENVÍO (MEJORADA)
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
        let tiempoEntrega;
        let tiempoDias;

        // 2. Buscar en la lista de capitales
        if (costosCapitales.has(ciudadNormalizada)) {
            const data = costosCapitales.get(ciudadNormalizada);
            costoEnvio = data.costo;
            tiempoDias = data.tiempo;
            console.log(`[Simulador] Cotización para Capital: ${ciudad}`);

        } else {
            // 3. Simular para "cualquier otro municipio"
            console.log(`[Simulador] Cotización para Municipio: ${ciudad}`);

            // Algoritmo de simulación simple (basado en la longitud del nombre)
            let hash = 0;
            for (let i = 0; i < ciudadNormalizada.length; i++) {
                hash += ciudadNormalizada.charCodeAt(i);
            }
            
            // Costo entre 14.000 y 25.000
            costoEnvio = 14000 + (hash % 11000); 
            costoEnvio = Math.round(costoEnvio / 100) * 100; // Redondear a 100s

            // Simular tiempo (Entre 4 y 8 días)
            tiempoDias = 4 + (hash % 5);
        }

        // 4. Crear rango de tiempo (ej. "2-4 días")
        tiempoEntrega = `${tiempoDias} a ${tiempoDias + 2} días hábiles`;

        // 5. Simular demora y responder
        setTimeout(() => {
            res.status(200).json({ 
                ciudad: ciudad,
                costoEnvio: costoEnvio,
                tiempoEntrega: tiempoEntrega
            });
        }, 750); // Una demora para que parezca real

    } catch (error) {
        res.status(500).json({ msg: 'Error al cotizar el envío.' });
    }
});


/**
 * RUTA FALSA DE GENERACIÓN DE GUÍA
 * POST /api/envio/generar
 */
router.post('/generar', (req, res) => {
    try {
        const { cliente, carrito, costoEnvio, tiempoEntrega } = req.body;
        
        if (!cliente || !carrito || carrito.length === 0 || !costoEnvio || !tiempoEntrega) {
            return res.status(400).json({ msg: 'Faltan datos para generar la guía.' });
        }

        console.log('--- [Simulador] Nuevo Pedido Recibido ---');
        console.log('Cliente:', cliente.nombre);
        console.log('Dirección:', cliente.direccion, cliente.ciudad);
        console.log('Envío:', `$${costoEnvio} (${tiempoEntrega})`);
        console.log('Productos:', carrito.map(p => `${p.nombre} (x${p.cantidad})`).join(', '));

        // Generar un número de guía falso
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