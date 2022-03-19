// server.js
const axios = require("axios");

//load dotenv config file ./.env
require("dotenv").config()

// init project
var express = require("express");
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let messages = [];

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

//Receive a message from Flow XO
app.post("/bot", function(request, response) {
  console.log(JSON.stringify(request.body));
  messages.push({from:'bot', message:request.body});
  return response.send({ message_id: "123" });
});

//Send a message to Flow XO
app.post("/message", function(request, response) {
  const message = request.body;
  const url = process.env.BOT_URL;
  const secret = process.env.BOT_SECRET;
  messages.push({from:'user', message})
  console.log(JSON.stringify(request.body));
  const opts = {
    headers: {
      Authorization: `Bearer ${secret}`
    }
  }
  return axios.post(url, request.body, opts).catch(console.log).then(response.send({ok:true})).catch(console.log);
});

//Retrieve the list of messages
app.get("/messages", function(request, response) {
  response.send({messages});
});

//Clear messages
app.get("/reset", function(request, response) {
  messages = [];
});
console.log(process.env.PORT);
// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
