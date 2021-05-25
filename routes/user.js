const express = require("express");
const router = express.Router();
const { validateBody, schemas } = require("../middleware/validateschema");
const { protect, authorize } = require("../middleware/auth");
const { readall, updateuser } = require("../controllers/user");

router.post("/read", protect, authorize("admin", "superadmin"), readall);
router.put("/updateuser/:id", protect, authorize("superadmin"), updateuser);

module.exports = router;
