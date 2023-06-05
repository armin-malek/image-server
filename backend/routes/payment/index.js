const express = require("express");
const router = express.Router();

router.use("/land", require("./land.js"));

module.exports = router;
