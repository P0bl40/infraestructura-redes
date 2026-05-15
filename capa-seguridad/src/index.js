const express = require('express');
const { isInBlacklist } = require('./blacklist');
const httpProxy = require("http-proxy");

const app = express();
const proxy = httpProxy.createProxyServer({});

const target = "http://capa-red:5000";

app.use((req, res) => {
	let { method, url } = req;

	if(!((method === 'GET') || (method === 'POST' && url ==='/sensordata'))){
		return res.status(500).send('Error al acceder');
	}

	const ip = req.ip || req.connection.remoteAddress;
	const cleanIP = ip.replace(/^::ffff:/, '');

	if(isInBlacklist(cleanIP)){
		console.warn(`[Control de acceso] Peticion bloqueada desde IP no permitida: ${cleanIP}`);
		return res.status(403).json({ error: 'Acceso denegado desde esta IP' });
	}

	proxy.web(req, res, { target }, (err) => {
		console.error(`[Control de acceso] Error al enviar al balanceador ${err.message}`);
		res.status(500).send('Error interno del proxy');
	});
});

app.listen(8080, () => {
	console.log('[Control de acceso] Middleware de filtrado escuchando en el puerto 8080');
});
