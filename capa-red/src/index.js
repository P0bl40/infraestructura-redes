const createMiddleware = require('./middleware');
const { startBalanceador } = require('./balanceador');

startBalanceador();

createMiddleware(4000);
createMiddleware(4001);
