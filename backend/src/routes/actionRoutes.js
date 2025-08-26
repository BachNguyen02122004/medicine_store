const express = require("express");
const router = express.Router();
const actionLogController = require('../controllers/actionLogController');



router.post('/', actionLogController.createActionLog);
router.get('/', actionLogController.getActionLog);


module.exports = router;