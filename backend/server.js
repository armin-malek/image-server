require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const cors = require("cors");
const requestIp = require("request-ip");
const cookieParser = require("cookie-parser");

var corsOptions = {
  origin: ["http://localhost:8080"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(requestIp.mw());
app.use(express.json({ limit: "20mb" }));
app.use(express.static("./public"));
app.use(cookieParser());

app.use("/", require("./routes"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
