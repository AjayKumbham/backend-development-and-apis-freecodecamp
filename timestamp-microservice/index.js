// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// Timestamp Microservice API endpoint
app.get("/api/:date?", function (req, res) {
  let date;
  const dateParam = req.params.date;
  
  // If no date parameter is provided, use current time
  if (!dateParam) {
    date = new Date();
  } else {
    // Check if the parameter is a Unix timestamp (number)
    const isUnixTimestamp = /^\d+$/.test(dateParam);
    
    if (isUnixTimestamp) {
      // Convert to number and create date from Unix timestamp (in milliseconds)
      date = new Date(parseInt(dateParam));
    } else {
      // Try to create date from the provided string
      date = new Date(dateParam);
    }
  }
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return res.json({ error: "Invalid Date" });
  }
  
  // Return the response with both Unix timestamp and UTC string
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
