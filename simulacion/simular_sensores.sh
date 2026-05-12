#!/bin/bash

# Script simular el envío de datos de sensores. Muestra en la terminal que datos se han enviado

while true; do
  # sensorID aleatorio
  sensorID=$((RANDOM % 100 + 1))
  
  # temperatura 20 y 30 grados
  temperature=$(awk -v min=20 -v max=30 'BEGIN{srand(); printf "%.2f", min+rand()*(max-min)}')
  
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1/sensorData?sensorID=${sensorID}&temperature=${temperature}")

  echo "Enviado sensorID=${sensorID} con temperatura=${temperature}"
  
  # intervalos de 2 segundos
  sleep 1 
done

