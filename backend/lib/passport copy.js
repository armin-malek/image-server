const localStategy = require("passport-local").Strategy;
const { prisma } = require("./db");
const bcrypt = require("bcryptjs");
const { currentIranTimeDB } = require("./functions");

module.exports = function (passport) {
  passport.use(
    "user-local",
    new localStategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          let user = await prisma.user.findUnique({
            where: { email: email },
          });
          if (user === null) {
            return done(new Error("حسابی با این شماره وجود ندارد"));
          }
          bcrypt.compare(password, user.password, async (err, isMatch) => {
            if (err) return done(new Error("خطایی رخ داد"));
            if (isMatch) {
              await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginDate: currentIranTimeDB() },
              });
              return done(null, user);
            } else {
              return done(new Error("کلمه عبور وارد شده صحیح نیست"));
            }
          });
        } catch (e) {
          console.log(e);
          return done(new Error("خطایی در ورود به سیستم رخ داد"));
        }
      }
    )
  );

  passport.use(
    "admin-local",
    new localStategy(
      { usernameField: "mobile" },
      async (email, password, done) => {
        try {
          let user = await prisma.user.findUnique({
            where: { email: email },
          });
          if (user === null) {
            return done(null, false, {
              message: "حسابی با شماره وارد شده پیدا نشد",
            });
          }
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "کلمه عبور وارد شده صحیح نیست",
              });
            }
          });
        } catch (e) {
          console.log(e);
          return done(null, false, {
            message: "خطا در ورود به سیستم",
          });
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    //console.log("Serializeing User", user.id);
    done(null, user.id);
  });
  passport.deserializeUser(async (userid, done) => {
    //console.log("Logging Out ", userid);
    try {
      let user = await prisma.user.findUnique({
        where: { id: userid },
        select: {
          id: true,
          email: true,
          password: true,
          isActive: true,
          fullName: true,
          role: true,
          emailVerified: true,
        },
      });
      if (user === null) {
        return done(null, false, {
          message: "کاربر پیدا نشد",
        });
      }
      done(null, user);
    } catch (e) {
      console.log(e);
      return done(null, false, {
        message: "خطا در خروج از سیستم",
      });
    }
  });
};
