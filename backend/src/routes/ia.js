const express = require('express');
const router = express.Router();
const IAController = require('../controllers/IAController');
const authMiddleware = require('../middleware/auth');

router.get('/context', authMiddleware(['ia:execute']), IAController.getContext);
router.post('/conversa', authMiddleware(['ia:execute']), IAController.processConversation);

module.exports = router;
