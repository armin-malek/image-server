// فریم ورک وب
const express = require("express");
const router = express.Router();
// کتابهانه هش الگوریتم bcrypt
const bcrypt = require("bcryptjs");
// بارگذاری متغیر های محیطی از سیستم
const jwtsecret = process.env.JWT_SECRET;
const jwtexp = process.env.JWTEXP;
// کتابخانه ایحاد توکن
const jwt = require("jsonwebtoken");
// ارتباط با دیتابیس
const { prisma } = require("../../lib/db");

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    // پیدا کاربر بر اساس ایمیل در دیتابیس
    let user = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true, password: true },
    });
    // بررسی وجود کاربر
    if (!user) {
      res.send({
        ok: false,
        msg: "ایمیل یا کلمه عبور وارد شده صحیح نیست",
      });
      return;
    }
    // بررسی صحت رمز

    bcrypt.compare(password, user.password, async (err, isMatch) => {
      // مدیریت ارورر
      if (err) throw err;
      if (isMatch) {
        //user.id = hashids.encode(user.id);
        delete user.password;
        const jwtToken = jwt.sign({ id: user.id }, jwtsecret, {
          expiresIn: jwtexp,
        });
        // set cookie
        res.cookie("jwt", jwtToken, {
          httpOnly: true,
          sameSite: "None",
          secure: false,
          maxAge: jwtexp,
        });
        return res.send({ ok: true, msg: "ورود موفق" });
      } else {
        res.send({
          ok: false,
          msg: "ایمیل یا کلمه عبور وارد شده صحیح نیست",
        });
        return;
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ msg: "خطایی در سیستم رخ داد" });
    return;
  }
});
module.exports = router;
