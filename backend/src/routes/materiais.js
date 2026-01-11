const express = require('express');
const router = express.Router();
const MaterialController = require('../controllers/MaterialController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', authMiddleware(), MaterialController.list);
router.post('/upload', authMiddleware(['materiais:write']), upload.single('arquivo'), MaterialController.upload);

module.exports = router;
