const express = require("express");
const { s3 } = require("../../../lib/s3");
const { S3_BUCKET } = require("../../../lib/s3");
const { prisma } = require("../../../lib/db");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let files = await prisma.file.findMany({ take: 20 });
    /*
    let data = await s3
      .listObjects({
        Bucket: S3_BUCKET,
      })
      .promise();
*/
    let str = "";
    files.forEach((item) => {
      str += `<img src="http://localhost:4000/img/${item.fileName}" loading="lazy"></img> 
      <hr class="spacing" />\r\n`;
    });

    res.send(str);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
router.use("/upload", require("./upload"));
module.exports = router;
