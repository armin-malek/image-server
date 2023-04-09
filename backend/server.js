require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
// const passport = require("passport");
/*
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const redisStore = new RedisStore({
  client: require("./lib/redis").redis,
  prefix: "image-server:",
});
*/
const requestIp = require("request-ip");

app.use(requestIp.mw());
app.use(express.json({ limit: "20mb" }));

/*
app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    // session Expire in 7 days
    cookie: {
      maxAge: 604800000,
      httpOnly: true,
      secure: process.env.NODE_ENV == true ? true : false,
    },
  })
);
*/
//passport config
/*
require("./lib/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());
*/

//require("./lib/passport");

app.use("/", require("./routes"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
