const redisClient = require("./config/redis");

console.log("hello from model");

exports.saveCallId = async (key, value) => {
  console.log("hello from save call id");
  await redisClient.connect();
  console.log("client is connected");
  return new Promise((resolve, reject) => {
    redisClient.SET(key, JSON.stringify(value), "EX", 86400, (err, res) => {
      console.log(key);
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(res);
    });
  });
};

exports.getCallId = (key) => {
  return new Promise((resolve, reject) => {
    redisClient.GET(key, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(res));
    });
  });
};