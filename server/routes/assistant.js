const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/assistantController');
const { optionalProtect } = require('../middleware/auth');

router.post('/chat', optionalProtect, chat);

module.exports = router;
