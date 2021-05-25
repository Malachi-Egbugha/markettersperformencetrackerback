const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

const { upload, readall, stats } = require("../controllers/upload");

router.post("/read", protect, authorize("admin", "superadmin"), readall);
router.post("/upload", upload);
router.post("/stats", stats);

module.exports = router;
