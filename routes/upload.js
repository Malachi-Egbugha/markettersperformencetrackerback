const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

const { upload, readall, stats, bot, test } = require("../controllers/upload");

router.post("/read", protect, authorize("admin", "superadmin"), readall);
router.post("/upload", upload);
router.post("/stats", protect, authorize("admin", "superadmin"), stats);
router.post("/bot", bot);
router.get("/test", test);

module.exports = router;
