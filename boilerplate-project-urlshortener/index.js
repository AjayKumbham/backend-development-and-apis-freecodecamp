require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Create URL Schema
const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: { type: Number, required: true, unique: true }
});

const Url = mongoose.model('Url', urlSchema);

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

// Routes
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API endpoint to create short URL
app.post('/api/shorturl', async (req, res) => {
  const { url } = req.body;
  
  // Validate URL
  if (!validUrl.isUri(url)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    // Check if URL already exists
    let existingUrl = await Url.findOne({ original_url: url });
    
    if (existingUrl) {
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url
      });
    }

    // Get the next short URL number
    const count = await Url.countDocuments();
    const newUrl = new Url({
      original_url: url,
      short_url: count + 1
    });

    await newUrl.save();
    
    res.json({
      original_url: newUrl.original_url,
      short_url: newUrl.short_url
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect short URL to original URL
app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const { short_url } = req.params;
    const url = await Url.findOne({ short_url });
    
    if (url) {
      return res.redirect(url.original_url);
    } else {
      return res.status(404).json({ error: 'No short URL found for the given input' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
const listener = app.listen(port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
