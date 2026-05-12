const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');

const app = express();
const port = 8080;

// Middleware para parsear JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Variables de entorno para el broker
const MQTT_BROKER = process.env.MQTT_BROKER || 'localhost';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

// Conexión al broker MQTT
const mqttClient = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`);

mqttClient.on('connect', () => {
  console.log(`Conectado al broker MQTT en ${MQTT_BROKER}:${MQTT_PORT}`);
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

  // Construir el tópico de publicación
  const topic = `sensors/${sensorID}/temperature`;
  const payload = JSON.stringify({ sensorID, temperature, timestamp: new Date().toISOString() });

  // Publicar en el broker MQTT
  mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) {
      console.error('Error publicando en MQTT:', err);
      return res.status(500).json({ error: 'Error publicando en MQTT' });
    }
    console.log(`Datos del sensor ${sensorID} publicados en el tópico ${topic}`);
    return res.status(200).json({ message: 'Datos recibidos y enviados a MQTT' });
  });
});

//comprobacion salud haproxy
app.get('/health', (req, res) => {
  res.status(200).send("OK");
});

// Iniciar el servidor Express
app.listen(port, () => {
  console.log(`Middleware escuchando en el puerto ${port}`);
});
