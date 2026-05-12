const mqtt = require('mqtt');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const express = require('express');
const bodyParser = require('body-parser');

const MQTT_BROKER = process.env.MQTT_BROKER || 'broker';
const MQTT_PORT   = process.env.MQTT_PORT   || 1883;
const INFLUX_URL  = process.env.INFLUX_URL  || 'http://influxdb:8086';
const INFLUX_TOKEN= process.env.INFLUX_TOKEN;
const INFLUX_ORG  = process.env.INFLUX_ORG;
const INFLUX_BUCKET = process.env.INFLUX_BUCKET;

const influxDB = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const writeApi = influxDB.getWriteApi(INFLUX_ORG, INFLUX_BUCKET);

const client = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`);

client.on('connect', () => {
  console.log('Storage Service conectado a MQTT');
  client.subscribe('sensors/+/temperature', { qos:1 });
});

client.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    const sensorID = data.sensorID;
    const temp = parseFloat(data.temperature);
    const timestamp = new Date(data.timestamp);

    const point = new Point('temperature')
      .tag('sensorID', sensorID)
      .floatField('value', temp)
      .timestamp(timestamp);

    writeApi.writePoint(point);
    writeApi.flush();
    console.log(`Guardado en Influx: sensor ${sensorID} → ${temp}`);
  } catch (e) {
    console.error('Error procesando mensaje MQTT:', e);
  }
});

const app = express();
app.use(bodyParser.json());

app.get('/health', (_req, res) => res.send('OK'));

app.get('/readings', (_req, res) => {
  res.json({ message: 'Implementar consulta a InfluxDB usando QueryApi si se desea.' });
});

const port = 3000;
app.listen(port, () => console.log(`Storage Service escuchando en ${port}`));

