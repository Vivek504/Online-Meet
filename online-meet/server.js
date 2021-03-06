require("dotenv").config();
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const port = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const Routes = require("./app/routes");
const path = require('path');

app.use([
  cors(),
  bodyParser.json(),
  bodyParser.urlencoded({ extended: false }),
  Routes,
]);

const io = (module.exports.io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
}));
const socketManager = require("./app/socketManager");
io.on("connection", socketManager);

// var express = require("express");
// var app = express();
// const port = process.env.PORT || 8000;
// app.use(express.urlencoded({ extended: true }))
// app.use(express.json())

// const server = require("http").createServer(app);

// var cors = require('cors');
// app.use(cors());

// const io = (module.exports.io = require('socket.io')(server, {
//   cors: {
//     origin: '*',
//   }
// }));

var mongoose = require("mongoose");
const { stringify } = require("querystring");
const req = require("express/lib/request");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/meet_db", { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', mongoConnected);

function mongoConnected() {
  var meetSchema = new mongoose.Schema({
    meet_code: String,
    host_email: String,
    host_fname: String,
    host_lname: String
  }, { collection: 'meets' });
  var Meet = mongoose.model("Meet", meetSchema);

  app.post("/create-meet", (req, res) => {
    Meet.create({
      meet_code: req.body.meet_code,
      host_email: req.body.host_email,
      host_fname: req.body.host_fname,
      host_lname: req.body.host_lname
    }).then(meet => res.json(meet))
      .catch(err => console.log(err))
  });
  app.get("/meet-details", (req, res) => {
    Meet.find(function (err, meets) {
      if (err) {
        console.log(err);
        res.json({ message: "Do not able to fetch data" });
      }
      else {
        res.send(meets);
      }
    });
  });
}
server.listen(port, function (err) {
  if (err)
    console.log("Error in server setup")
  else
    console.log("Server listening on Port", port);
});