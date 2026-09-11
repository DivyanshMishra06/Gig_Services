const express = require('express');
const { geocodeAddress } = require('../controllers/locationController');

const router = express.Router();
router.get('/geocode', geocodeAddress);

module.exports = router;
