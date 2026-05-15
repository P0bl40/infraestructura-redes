const express = require('express');
const httpProxy = require('http-proxy');

function startBalanceador() {
	const app = express();
	const proxy = httpProxy.createProxyServer({});
	const servers = ['http://localhost:4000', 'http://localhost:4001'];
	let current = 0;

	app.all('/sensorData', (req, res) => {
		let target = servers[current];
		console.log(`[Balanceador] Redirigiendo a ${target}`);
		current = (current + 1) % servers.length;

		proxy.web(req, res, { target }, (err) => {
			console.error(`[Balanceador] Error al redirigir a ${target}: ${err.message}`);
			res.status(500).send('Error de balanceador');
		});
	});

	app.listen(5000, () => {
		console.log('Balanceador de carga escuchando en el puerto 5000');
	});
}
module.exports = { startBalanceador };
