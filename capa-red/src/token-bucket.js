class TokenBucket {
  constructor(rate, capacity) {
    this.rate = rate;  // Número de tokens generados por segundo
    this.capacity = capacity;  // Capacidad máxima del cubo
    this.tokens = capacity;  // Comienza con el cubo lleno
    this.lastCheck = Date.now();  // Tiempo del último chequeo
  }

  // Método para obtener el token y decidir si la operación puede proceder
  tryConsume() {
    const now = Date.now();
    const elapsed = (now - this.lastCheck) / 1000;  // El tiempo transcurrido en segundos
    this.lastCheck = now;

    // Generamos tokens según el tiempo transcurrido
    this.tokens += elapsed * this.rate;
    if (this.tokens > this.capacity) {
      this.tokens = this.capacity;  // No más tokens que la capacidad
    }

    if (this.tokens >= 1) {
      this.tokens -= 1;  // Consumir un token
      return true;  // Podemos continuar con la operación
    } else {
      return false;  // No hay tokens disponibles
    }
  }
}

module.exports = TokenBucket;
