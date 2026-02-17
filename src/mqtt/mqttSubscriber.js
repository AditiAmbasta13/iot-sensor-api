const mqtt = require('mqtt');
const SensorReading = require('../models/SensorReading');

const startMQTTSubscriber = () => {
  const brokerUrl = process.env.MQTT_BROKER_URL;

  if (!brokerUrl) {
    console.warn('MQTT_BROKER_URL not set — MQTT subscriber disabled.');
    return;
  }

  const client = mqtt.connect(brokerUrl, {
    clientId: `iot-sensor-api-${Math.random().toString(16).slice(2, 8)}`,
    clean: true,
    reconnectPeriod: 5000,
  });

  client.on('connect', () => {
    console.log(`MQTT connected to ${brokerUrl}`);
    // Wildcard subscription: catches all deviceIds
    client.subscribe('iot/sensor/+/temperature', (err) => {
      if (err) {
        console.error('MQTT subscribe error:', err.message);
      } else {
        console.log('Subscribed to topic: iot/sensor/+/temperature');
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      // Topic format: iot/sensor/<deviceId>/temperature
      const parts = topic.split('/');
      const deviceId = parts[2];

      let payload;
      try {
        payload = JSON.parse(message.toString());
      } catch {
        // If not JSON, treat the raw value as temperature
        payload = { temperature: parseFloat(message.toString()) };
      }

      const { temperature, timestamp } = payload;

      if (!deviceId || temperature === undefined) {
        console.warn(`MQTT: skipping malformed message on topic ${topic}`);
        return;
      }

      const reading = await SensorReading.create({
        deviceId,
        temperature: Number(temperature),
        timestamp: timestamp || Date.now(),
      });

      console.log(`MQTT: saved reading for ${deviceId} — ${temperature}°`);
    } catch (error) {
      console.error('MQTT message handler error:', error.message);
    }
  });

  client.on('error', (err) => {
    console.error('MQTT connection error:', err.message);
  });

  client.on('reconnect', () => {
    console.log('MQTT reconnecting...');
  });
};

module.exports = startMQTTSubscriber;