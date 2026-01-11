const express = require('express');
const router = express.Router();
const KnowledgeController = require('../controllers/KnowledgeController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware(), KnowledgeController.list);
router.post('/', authMiddleware(['knowledge:write']), KnowledgeController.create);
router.put('/:id', authMiddleware(['knowledge:write']), KnowledgeController.update);
router.delete('/:id', authMiddleware(['knowledge:write']), KnowledgeController.delete);

module.exports = router;
