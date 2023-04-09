const express = require("express");
const { s3 } = require("../../../lib/s3");
const { S3_BUCKET } = require("../../../lib/s3");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let data = await s3
      .putBucketLifecycle({
        Bucket: S3_BUCKET,
        LifecycleConfiguration: { Rules: [] },
      })
      .promise();

    res.send(data);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
router.use("/upload", require("./upload"));
module.exports = router;
