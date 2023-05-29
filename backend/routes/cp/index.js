const express = require("express");
const { prisma } = require("../../lib/db");
const router = express.Router();
router.use(require("../../middleware/jwt"));

router.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        email: true,
        emailVerified: true,
        fullName: true,
        Customer: {
          select: {
            storageUsed: true,
            trafficUsed: true,
            _count: { select: { Files: true } },
          },
        },
      },
    });

    // tabdil BigInt ha be string
    user.Customer.storageUsed = user.Customer.storageUsed.toString();
    user.Customer.trafficUsed = user.Customer.trafficUsed.toString();

    res.send({ ok: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).send("خطایی رخ داد");
  }
});
router.use("/library", require("./library"));
module.exports = router;
