const express = require("express");
const router = express.Router();
const { validateBody, emailschemas } = require("../middleware/validateschema");
const { protect, authorize } = require("../middleware/auth");
const { readall, updateuser, finduser } = require("../controllers/user");

router.post("/read", protect, authorize("admin", "superadmin"), readall);
router.put("/updateuser/:id", protect, authorize("superadmin"), updateuser);
router.put(
  "/updateemail/:id",
  validateBody(emailschemas.authSchema),
  protect,
  authorize("superadmin"),
  updateuser
);
router.put(
  "/updatedetail/:id",
  protect,
  authorize("admin", "superadmin", "normal"),
  updateuser
);
router.post("/finduser/:id", finduser);

module.exports = router;
