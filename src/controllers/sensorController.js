const SensorReading = require('../models/SensorReading');

// POST /api/sensor/ingest
const ingestReading = async (req, res) => {
  try {
    const { deviceId, temperature, timestamp } = req.body;

    // Validate required fields
    if (!deviceId || deviceId.toString().trim() === '') {
      return res.status(400).json({ success: false, error: 'deviceId is required' });
    }
    if (temperature === undefined || temperature === null) {
      return res.status(400).json({ success: false, error: 'temperature is required' });
    }
    if (typeof temperature !== 'number') {
      return res.status(400).json({ success: false, error: 'temperature must be a number' });
    }

    const reading = await SensorReading.create({
      deviceId: deviceId.trim(),
      temperature,
      timestamp: timestamp || Date.now(),
    });

    return res.status(201).json({ success: true, data: reading });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sensor/:deviceId/latest
const getLatestReading = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const reading = await SensorReading.findOne({ deviceId })
      .sort({ timestamp: -1 })
      .lean();

    if (!reading) {
      return res.status(404).json({
        success: false,
        error: `No readings found for device: ${deviceId}`,
      });
    }

    return res.status(200).json({ success: true, data: reading });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { ingestReading, getLatestReading };