const BOT_TOKEN = '8640293443:AAF89OJgK90c0TYNObg8zwa02DE2b_LEapM';
const CHAT_ID ='751497873';

async function enviarMensajeTlg(mensaje) {
	const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

	try{
		const respuesta = await fetch(url, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				chat_id: CHAT_ID,
				text: mensaje,
				parse_mode: 'Markdown'
			})
		});
		const resultado = await respuesta.json();

		if (resultado.ok){
			console.log('Mensaje enviado correctamente');
		}
		else {
			console.error('Telegram rechazo el mensaje: ', resultado.description);
		}
	}catch(error){
		console.error('Error al conectarse a Telegram: ', error.message);
	}


}

module.exports = { enviarMensajeTlg };
