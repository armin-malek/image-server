const { createClient } = require("redis");
const redis = createClient({
  url: `redis://:${process.env.REDISPASS}@${process.env.REDISHOST}:${process.env.REDISPORT}`,
  //legacyMode: true,
  database: process.env.REDISDBINDEX,
});
/*
const redis = createClient({
  url: `redis://:${process.env.REDISPASS}@${process.env.REDISHOST}:${process.env.REDISPORT}`,
  database: process.env.REDISDBINDEX,
});
redis.on("error", (err) => console.log("Redis Client Error", err));
redis.connect().then(async () => {
  console.log("Redis Connected");
  LoadSettings();
});
*/
redis.on("error", (err) => console.log("RedisSession Client Error", err));
redis.connect().then(async () => {
  console.log("RedisSession Connected");
});

module.exports.redis = redis;
