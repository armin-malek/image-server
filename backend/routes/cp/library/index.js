const express = require("express");
const { s3 } = require("../../../lib/s3");
const { S3_BUCKET } = require("../../../lib/s3");
const { prisma } = require("../../../lib/db");
const router = express.Router();

router.use("/upload", require("./upload"));
module.exports = router;
