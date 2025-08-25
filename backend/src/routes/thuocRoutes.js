const express = require("express");
const router = express.Router();
const ThuocController = require("../controllers/thuocController");
const { validateThuoc, checkValidation } = require("../middleware/validation");
const { validateId, validatePagination } = require("../utils/helpers");

// GET /api/thuoc - Get all thuoc with pagination
router.get("/", validatePagination, ThuocController.getAllThuoc);

// GET /api/thuoc/:id - Get thuoc by ID
router.get("/:id", validateId, ThuocController.getThuocById);

// POST /api/thuoc - Create new thuoc
router.post("/", validateThuoc, checkValidation, ThuocController.createThuoc);

// PUT /api/thuoc/:id - Update thuoc
router.put(
  "/:id",
  validateId,
  validateThuoc,
  checkValidation,
  ThuocController.updateThuoc
);

// DELETE /api/thuoc/:id - Delete thuoc
router.delete("/:id", validateId, ThuocController.deleteThuoc);

module.exports = router;
