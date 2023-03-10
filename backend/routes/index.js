const express = require("express");
const router = express.Router();
router.get("/", (req, res) => res.send("Hello World!"));

router.use("/img", require("./img"));
module.exports = router;
