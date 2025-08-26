const express = require("express");
const router = express.Router();
const thuocController = require("../controllers/thuocController");

router.get("/", thuocController.getAllThuoc);
router.post("/", thuocController.createThuoc);
router.put("/:id", thuocController.updateThuoc);
router.delete("/:id", thuocController.deleteThuoc);
router.get("/all", thuocController.getAllThuocNoPaging);

module.exports = router;
