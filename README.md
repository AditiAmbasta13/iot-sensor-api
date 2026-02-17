# IoT Sensor API

A Node.js backend service that ingests IoT sensor temperature readings, persists them to MongoDB Atlas, and exposes a REST API to retrieve the latest reading per device. Includes an MQTT subscriber for bonus real-time ingestion.

## Tech Stack
- Node.js 18+ / Express
- MongoDB Atlas + Mongoose
- MQTT (via `mqtt` package)

## Preview
<img width="1901" height="872" alt="image" src="https://github.com/user-attachments/assets/2a1b206f-8b26-4c37-af5f-7110513461e0" />
<img width="1366" height="601" alt="image" src="https://github.com/user-attachments/assets/9728f328-a130-4901-85c0-5fc5567e9a71" />
<img width="1436" height="604" alt="image" src="https://github.com/user-attachments/assets/57cc5439-4cc0-44a2-8e24-b085b4458a9f" />

## Setup

**1. Clone and install**
```bash
git clone <your-repo-url>
cd iot-sensor-api
npm install
```

**2. Configure environment**
```bash
cp .env.example .env
# Edit .env and set your MONGO_URI from MongoDB Atlas
```

**3. Run**
```bash
npm start        # production
npm run dev      # with nodemon (auto-reload)
```

## API Reference

### POST /api/sensor/ingest
Ingest a sensor temperature reading.

**Body:**
```json
{
  "deviceId": "sensor-01",
  "temperature": 32.1,
  "timestamp": 1705312440000
}
```
`timestamp` is optional — defaults to current time if omitted.

**curl example:**
```bash
curl -X POST http://localhost:3000/api/sensor/ingest \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "sensor-01", "temperature": 32.1, "timestamp": 1705312440000}'
```

**Success response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "deviceId": "sensor-01",
    "temperature": 32.1,
    "timestamp": 1705312440000,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### GET /api/sensor/:deviceId/latest
Returns the latest reading for a device.

**curl example:**
```bash
curl http://localhost:3000/api/sensor/sensor-01/latest
```

**Success response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "deviceId": "sensor-01",
    "temperature": 32.1,
    "timestamp": 1705312440000,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## MQTT Subscriber (Bonus)

Set `MQTT_BROKER_URL` in `.env` to enable. The subscriber listens on:
```
iot/sensor/<deviceId>/temperature
```

Publish a reading (JSON or raw number):
```bash
# JSON payload
mosquitto_pub -h broker.hivemq.com -t "iot/sensor/sensor-01/temperature" \
  -m '{"temperature": 29.5, "timestamp": 1705312440000}'

# Raw number (temperature only)
mosquitto_pub -h broker.hivemq.com -t "iot/sensor/sensor-01/temperature" -m "29.5"
```

Messages are automatically saved to MongoDB with the `deviceId` extracted from the topic.
