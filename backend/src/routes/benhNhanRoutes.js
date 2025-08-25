const express = require("express");
const router = express.Router();
const BenhNhanController = require("../controllers/benhNhanController");
const {
  validateBenhNhan,
  checkValidation,
} = require("../middleware/validation");
const { validateId, validatePagination } = require("../utils/helpers");

// GET /api/benhnhan - Get all patients with pagination
router.get("/", validatePagination, BenhNhanController.getAllBenhNhan);

// GET /api/benhnhan/:id - Get patient by ID
router.get("/:id", validateId, BenhNhanController.getBenhNhanById);

// POST /api/benhnhan - Create new patient
router.post(
  "/",
  validateBenhNhan,
  checkValidation,
  BenhNhanController.createBenhNhan
);

// PUT /api/benhnhan/:id - Update patient
router.put(
  "/:id",
  validateId,
  validateBenhNhan,
  checkValidation,
  BenhNhanController.updateBenhNhan
);

// DELETE /api/benhnhan/:id - Delete patient
router.delete("/:id", validateId, BenhNhanController.deleteBenhNhan);

module.exports = router;
