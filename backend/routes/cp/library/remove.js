const express = require("express");
const { prisma } = require("../../../lib/db");
const { s3, S3_BUCKET } = require("../../../lib/s3");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { fileID } = req.body;
    if (!fileID) {
      return res.send({ ok: false, msg: "شناسه فایل لازم است" });
    }

    const file = await prisma.file.findUnique({
      where: { id: fileID },
      select: {
        fileName: true,
        Customer: { select: { User: { select: { id: true } } } },
      },
    });

    if (!file) {
      return res.send({ ok: false, msg: "فایل وجود ندارد" });
    }

    if (file.Customer.User.id != req.user.id) {
      return res.send({ ok: false, msg: "شما به این فایل دسترسی ندارید" });
    }

    await prisma.file.delete({ where: { id: fileID } });
    await s3.deleteObject({ Bucket: S3_BUCKET, Key: file.fileName }).promise();

    res.send({ ok: true, msg: "فایل با موفقیت حذف شد" });
  } catch (err) {
    console.log(err);
    res.status(500).send("خطایی رخ داد");
  }
});

module.exports = router;
