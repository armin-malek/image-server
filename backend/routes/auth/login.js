const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwtsecret = process.env.JWT_SECRET;
// const refreshsecret = process.env.JWT_REFRESH_SECRET;
const jwtexp = process.env.JWTEXP;
// const jwtrefreshexp = process.env.JWTREFRESHEXP;
const jwt = require("jsonwebtoken");
//const { redis } = require("../../../../redis");
const pify = require("pify");
const { prisma } = require("../../lib/db");

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    // find email in database
    let user = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true, password: true },
    });
    // check if user exists
    if (!user) {
      res.send({
        ok: false,
        msg: "ایمیل یا کلمه عبور وارد شده صحیح نیست",
      });
      return;
    }
    // check if password is correct

    bcrypt.compare(password, user.password, async (err, isMatch) => {
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
/*
//Using Refresh Token to Generate new JWT access Token
router.get("/refresh", async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  const token = cookies.jwt;
  try {
    if (token == null) return res.sendStatus(401);
    //check if refresh token exist in Redist List
    let item = await redis.lPos("refreshTokens", token);
    if (item == null) return res.sendStatus(403);
    let user = await pify(jwt).verify(token, refreshsecret);
    user.id = hashids.decode(user.id)[0];
    const dbuser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    delete dbuser.password;
    const jwtToken = await pify(jwt).sign(dbuser, jwtsecret, {
      expiresIn: jwtexp,
    });
    return res.send({ accesstoken: jwtToken });
    
    // jwt.verify(token, refreshsecret, async (err, user) => {
    //   if (err) return res.sendStatus(403);
    //   user.id = hashids.decode(user.id)[0];
    //   const dbuser = await prisma.user.findUnique({
    //     where: { id: user.id },
    //   });
    //   delete dbuser.password;
    //   const jwtToken = jwt.sign(dbuser, jwtsecret, {
    //     expiresIn: jwtexp,
    //   });
    //   return res.json({ accesstoken: jwtToken });
    // });
    
  } catch (err) {
    console.log(err);
    return res.sendStatus(403);
  }
});
*/
module.exports = router;
