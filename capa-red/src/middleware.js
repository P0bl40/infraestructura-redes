const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');

const TokenBucket = require('./token-bucket.js');

const bucket = new TokenBucket(1, 3);

function createMiddleware(port) {

	const app = express();

	// Middleware para parsear JSON
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	// Variables de entorno para el broker
	const MQTT_BROKER = process.env.MQTT_BROKER || 'localhost';
	const MQTT_PORT = process.env.MQTT_PORT || 1883;

	// Conexión al broker MQTT
	const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`);

	mqttClient.on('connect', () => {
	  console.log(`[Middleware] Conectado al broker MQTT en ${MQTT_BROKER}:${MQTT_PORT}`);
	});

	// Endpoint para recibir los datos de sensores (GET y POST)
	app.all('/sensorData', (req, res) => {
	  // Extraer datos de la query o del body, según el método
	  const data = req.method === 'GET' ? req.query : req.body;
  
	  // Ejemplo: Extraemos sensorID y la medición de temperatura (se debe extender a todas las variables)
	  const sensorID = data.sensorID;
	  const temperature = data.temperature || data.temp;

	  if (!sensorID || (!temperature && temperature !== 0)) {
	    return res.status(400).json({ error: 'Faltan datos obligatorios (sensorID, temperature)' });
	  }

	  if (!bucket.tryConsume()){
		  console.error('[Middleware] Error: demasiadas solicitudes, tickets agotados.');
		  return res.status(429).json({ status: 'Demasiadad peticiones, prueba de nuevo luego' });
	  }

	  // Construir el tópico de publicación
	  const topic = `sensors/${sensorID}/temperature`;
	  const payload = JSON.stringify({ sensorID, temperature, timestamp: new Date().toISOString() });
	
	  // Publicar en el broker MQTT
	  mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
	    if (err) {
	      console.error('[Middleware] Error publicando en MQTT:', err);
	      return res.status(500).json({ error: 'Error publicando en MQTT' });
	    }
	    console.log(`[Middleware] Datos del sensor ${sensorID} publicados en el tópico ${topic}`);
	    return res.status(200).json({ message: 'Datos recibidos y enviados a MQTT' });
	  });
	});

	//comprobacion salud haproxy
	app.get('/health', (req, res) => {
	  res.status(200).send("OK");
	});

	// Iniciar el servidor Express
	app.listen(port, () => {
	  console.log(`[Middleware] Middleware escuchando en el puerto ${port}`);
	});
}

module.exports = createMiddleware
