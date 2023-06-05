const express = require("express");
const { prisma } = require("../../../lib/db");
const router = express.Router();
const DOMAIN_ROOT = process.env.DOMAIN_ROOT;

router.get("/", async (req, res) => {
  try {
    let files = await prisma.file.findMany({
      where: { Customer: { User: { id: req.user.id } } },
      select: { fileName: true, id: true, dateCreated: true },
    });

    files.map((item) => {
      item.img = DOMAIN_ROOT + "/cp/library/img/" + item.fileName;
    });

    res.send({ ok: true, files });
  } catch (err) {
    console.log(err);
    res.status(500).send("خطایی رخ داد");
  }
});

router.use("/upload", require("./upload"));
router.use("/img", require("./img"));
router.use("/remove", require("./remove"));
module.exports = router;
