const express = require("express");
const router = express.Router();
const { prisma } = require("../../lib/db");
const JWT = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, emailVerified: true },
    });

    if (user.emailVerified == true) {
      return res.send({ ok: false, msg: "ایمیل شما قبلا تایید شده است." });
    }

    const token = JWT.sign({ userID: user.id }, JWT_SECRET, {
      expiresIn: 60 * 10,
    });

    // send the token to users email
    const verificationUrl = `http://localhost:4000/auth/email-verify/${token}`;

    console.log(verificationUrl);

    res.send({ ok: true, msg: "ایمیل خود را بررسی کنید" });
  } catch (err) {
    console.log(err);
    res.status(500).send("خطایی رخ داد");
  }
});

module.exports = router;
