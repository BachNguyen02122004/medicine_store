const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');



router.get('/patient', prescriptionController.getPrescriptionsByPatient);
router.get('/', prescriptionController.getPrescriptions);
router.get('/:id', prescriptionController.getPrescriptionDetail);
router.post('/', prescriptionController.createPrescription);
router.put('/:id', prescriptionController.updatePrescription);

module.exports = router;
