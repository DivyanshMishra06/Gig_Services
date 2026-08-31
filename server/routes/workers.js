const express = require('express');
const router = express.Router();
const { getWorkers, getWorkerById, updateWorker, updateAvailability, getWorkerEarnings, getWorkerWelfare } = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getWorkers);
router.get('/earnings', protect, authorize('worker'), getWorkerEarnings);
router.get('/welfare', protect, authorize('worker'), getWorkerWelfare);
router.get('/:id', getWorkerById);
router.put('/update', protect, authorize('worker'), updateWorker);
router.put('/availability', protect, authorize('worker'), updateAvailability);

module.exports = router;
