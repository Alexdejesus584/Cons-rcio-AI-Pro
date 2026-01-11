const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/LeadController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware(['leads:read']), LeadController.listAll);
router.get('/quentes', authMiddleware(['leads:read']), LeadController.listHotLeads);
router.put('/:id/status', authMiddleware(['leads:write']), LeadController.updateStatus);

module.exports = router;
