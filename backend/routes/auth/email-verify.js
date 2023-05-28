const express = require("express");
const router = express.Router();
const { prisma } = require("../../lib/db");
const JWT = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = JWT.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userID },
      select: { id: true, emailVerified: true },
    });

    if (user.emailVerified === true) {
      let msg = "ایمیل شما قبلا تایید شده است";
      return res.redirect("https://localhost:4000?msg=" + msg);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    let msg = "ایمیل شما با موفقیت تایید شد";
    res.redirect("https://localhost:4000/?msg=" + msg);
  } catch (err) {
    console.log(err);
    res.status(500).send("خطایی رخ داد");
  }
});

module.exports = router;
