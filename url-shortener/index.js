require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { URL } = require('url');
const bodyParser = require('body-parser');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// In-memory storage
let urlDatabase = [];
let urlCounter = 1;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

// Custom URL validation function
function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false;
    }
    // Check if hostname is present
    if (!urlObj.hostname) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoint to create short URL
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  
  // Validate URL format
  if (!isValidUrl(url)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    // Check if URL already exists
    const existingUrl = urlDatabase.find(entry => entry.original_url === url);
    
    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url
      });
    }

    // Create new URL entry
    const short_url = urlCounter++;
    const newUrl = {
      original_url: url,
      short_url: short_url
    };
    
    urlDatabase.push(newUrl);
    
    // Return exactly the format expected by the tests
    res.json({
      original_url: url,
      short_url: short_url
    });
  } catch (err) {
    console.error(err);
    res.json({ error: 'invalid url' });
  }
});

// Redirect short URL to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  try {
    const short_url = parseInt(req.params.short_url);
    if (isNaN(short_url)) {
      return res.json({ error: 'invalid url' });
    }
    
    const url = urlDatabase.find(entry => entry.short_url === short_url);
    
    if (url) {
      return res.redirect(url.original_url);
    } else {
      return res.json({ error: 'No short URL found for the given input' });
    }
  } catch (err) {
    console.error(err);
    res.json({ error: 'invalid url' });
  }
});

// Start server
const listener = app.listen(port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
