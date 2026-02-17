const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: [true, 'deviceId is required'],
    trim: true,
  },
  temperature: {
    type: Number,
    required: [true, 'temperature is required'],
  },
  timestamp: {
    type: Number, // epoch ms
    default: () => Date.now(),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast latest-reading queries per device
sensorReadingSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorReading', sensorReadingSchema);