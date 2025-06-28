const express = require('express');
const healthController = require('../controllers/healthController');

const router = express.Router();

router.get('/', healthController.getHealth);
router.get('/detailed', healthController.getDetailedHealth);
router.get('/service/:serviceName', healthController.getServiceStatus);

module.exports = router;
