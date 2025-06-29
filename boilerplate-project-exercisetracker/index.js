require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/exercise-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});

const exerciseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

// Routes
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.json({ error: 'Username is required' });
    }
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json(existingUser);
    }
    
    const newUser = new User({ username });
    await newUser.save();
    res.json({ username: newUser.username, _id: newUser._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { _id } = req.params;
    let { description, duration, date } = req.body;
    
    // Validate required fields
    if (!description || !duration) {
      return res.json({ error: 'Description and duration are required' });
    }
    
    // Convert duration to number
    duration = parseInt(duration);
    if (isNaN(duration)) {
      return res.json({ error: 'Duration must be a number' });
    }
    
    // Parse date or use current date
    const exerciseDate = date ? new Date(date) : new Date();
    
    // Check if user exists
    const user = await User.findById(_id);
    if (!user) {
      return res.json({ error: 'User not found' });
    }
    
    // Create and save exercise
    const exercise = new Exercise({
      userId: _id,
      description,
      duration,
      date: exerciseDate
    });
    
    await exercise.save();
    
    // Return user object with exercise fields
    res.json({
      _id: user._id,
      username: user.username,
      date: exerciseDate.toDateString(),
      duration: exercise.duration,
      description: exercise.description
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get exercise log
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;
    
    // Check if user exists
    const user = await User.findById(_id);
    if (!user) {
      return res.json({ error: 'User not found' });
    }
    
    // Build query
    let query = { userId: _id };
    let dateFilter = {};
    
    // Add date filters if provided
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);
    if (from || to) query.date = dateFilter;
    
    // Get exercises with optional limit
    let exercisesQuery = Exercise.find(query, 'description duration date -_id');
    if (limit) {
      exercisesQuery = exercisesQuery.limit(parseInt(limit));
    }
    
    const exercises = await exercisesQuery.exec();
    
    // Format response
    const log = exercises.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date.toDateString()
    }));
    
    res.json({
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
const listener = app.listen(port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
