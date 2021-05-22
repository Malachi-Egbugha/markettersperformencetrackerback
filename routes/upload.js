const express = require("express");
const router = express.Router();

const { upload, readall } = require("../controllers/upload");

router.post("/read", readall);
router.post("/upload", upload);

module.exports = router;
