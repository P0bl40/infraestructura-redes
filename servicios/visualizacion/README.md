# servicios/visualizacion/README.md

## Servicio de Visualización (Grafana)

Directorio para recursos de visualización: dashboards JSON, scripts de provisioning.

### Levantamiento

```bash
docker-compose up -d grafana
```

### Acceso

- UI en `http://<host>:3000`, usuario `admin` (cambiar contraseña).
- Data source: InfluxDB configurado en URL `http://influxdb:8086`, token `my-token`.

En grafana se debe configurar un dashboard para el correcto visualizado de los datos.
Para configurarlo correctamente hay que especificar los siguientes datos:
- Database: Flux
- url: http://influxdb:8086
- organzation: myorg
- Token: my-token
- bucket: sensordata

### Query

from(bucket: "sensordata")
  |> range(start: -15m)
  |> filter(fn: (r) => r._measurement == "medicion")
  |> filter(fn: (r) => exists r.sensorID)
  |> filter(fn: (r) => r._field == "temperatura" or r._field == "humedad" or r._field == "CO2" or r._field == "compuestos combustibles")
  |> keep(columns: ["_time", "_field", "_value", "sensorID"])

  Tambien hay que configurar opciones de visualización para poder ver correctamente los datos
