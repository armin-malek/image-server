const express = require("express");
const router = express.Router();
const mime = require("mime-types");
const { prisma } = require("../../../lib/db");
const { getObject, s3, S3_BUCKET } = require("../../../lib/s3");

// handle image request
router.get("/:imageName", async (req, res) => {
  try {
    const { imageName } = req.params;

    const fileInDB = await prisma.file.findUnique({
      where: { fileName: imageName },
      select: {
        id: true,
        Customer: { select: { User: { select: { id: true } } } },
      },
    });

    if (!fileInDB) {
      return res.status(404).send("404 - NOT FOUND");
    }

    if (fileInDB.Customer.User.id != req.user.id) {
      return res.status(401).send("401 - Unauthorized");
    }

    // Stream the Image
    s3.getObject({ Bucket: S3_BUCKET, Key: imageName })
      .on("httpHeaders", function (statusCode, headers) {
        res.set("Content-Length", headers["content-length"]);
        res.set("Content-Type", mime.lookup(imageName));
        // hefayat stream be Client
        this.response.httpResponse.createUnbufferedStream().pipe(res);
      })
      .send();
  } catch (err) {
    console.log(err);
    res.status(500).send("somthing went wrong");
  }
});

module.exports = router;
