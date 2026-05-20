#!/bin/bash

# Script simular el envío de datos de sensores. Muestra en la terminal que datos se han enviado

while true; do
  # sensorID aleatorio
  sensorID=$((RANDOM % 21428 + 1))
  
  # temperatura 20 y 30 grados
  temperature=$(awk -v min=20 -v max=30 'BEGIN{srand(); printf "%.2f", min+rand()*(max-min)}')

  humedad=$((RANDOM % 50 + 30))

  co2=$((RANDOM % 500 +200))

  compuestos=$((RANDOM % 50 + 1))
  
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:8080/sensorData?sensorID=${sensorID}&temperatura=${temperature}&humedad=${humedad}&co2=${co2}&cco=${compuestos}")

  echo "Enviado sensorID=${sensorID} con temperatura=${temperature}"
  
  # intervalos de 2 segundos
  sleep 0.4 
done

