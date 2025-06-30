require('dotenv').config();
let express = require('express');
let app = express();
let bodyParser = require('body-parser');

console.log("Hello World");

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: false }));

// Logger middleware
app.use(function(req, res, next) {
  console.log(req.method + " " + req.path + " - " + req.ip);
  next();
});

// Serve static assets from the /public folder
app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/json', function(req, res) {
  let message = "Hello json";
  if (process.env.MESSAGE_STYLE === "uppercase") {
    message = message.toUpperCase();
  }
  res.json({"message": message});
});

app.get('/now', function(req, res, next) {
  req.time = new Date().toString();
  next();
}, function(req, res) {
  res.json({time: req.time});
});

app.get('/:word/echo', function(req, res) {
  res.json({echo: req.params.word});
});

app.get('/name', function(req, res) {
  const { first, last } = req.query;
  res.json({ name: `${first} ${last}` });
});

app.post('/name', function(req, res) {
  const { first, last } = req.body;
  res.json({ name: `${first} ${last}` });
});

module.exports = app;