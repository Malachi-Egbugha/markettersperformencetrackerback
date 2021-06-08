const express = require("express");
const router = express.Router();
const { protect, authorize, apiauthorize } = require("../middleware/auth");

const {
  upload,
  readall,
  stats,
  bot,
  test,
  findstaff,
} = require("../controllers/upload");

router.post(
  "/read",
  protect,
  authorize("admin", "superadmin", "management"),
  readall
);
router.post("/upload", upload);
router.post(
  "/stats",
  //protect,
  //authorize("admin", "superadmin", "management"),
  stats
);
router.post("/bot", apiauthorize, bot);
router.post("/staffperf/:id", apiauthorize, findstaff);
router.get("/test", test);

module.exports = router;
