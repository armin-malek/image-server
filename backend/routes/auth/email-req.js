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
    }); // send the token to users email
    const verificationUrl = `auth/email-verify/${token}`;
    console.log("http://localhost:4000/" + verificationUrl);
    res.send({
      ok: true,
      msg: "لینک تایید به ایمیلتان ارسال شد - جهت تایید وارد ایمیل خود شده و روی لینک تایید کلیک کنید.",
      url: verificationUrl,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("خطایی رخ داد");
  }
});
module.exports = router;
