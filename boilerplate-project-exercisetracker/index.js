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
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/exercise_tracker';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'exercise_tracker'  // Explicitly set the database name
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Handle connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define schemas
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    unique: true,  // Ensure usernames are unique
    trim: true,    // Remove any whitespace
    minlength: 1   // Ensure username is not empty
  }
}, { 
  // Use a custom collection name to avoid conflicts
  collection: 'exercise_users',
  // Don't include the __v field
  versionKey: false
});

const exerciseSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  duration: { 
    type: Number, 
    required: true,
    min: 1  // Duration should be at least 1 minute
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, {
  // Use a custom collection name to avoid conflicts
  collection: 'exercise_logs',
  // Don't include the __v field
  versionKey: false
});

// Create models
const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    message: 'Exercise Tracker API',
    endpoints: [
      {
        method: 'POST',
        path: '/api/users',
        description: 'Create a new user',
        body: { username: 'String (required)' },
        response: { _id: 'String', username: 'String' }
      },
      {
        method: 'GET',
        path: '/api/users',
        description: 'Get all users',
        response: 'Array of user objects'
      },
      {
        method: 'POST',
        path: '/api/users/:_id/exercises',
        description: 'Add exercise for a user',
        params: { _id: 'User ID (required)' },
        body: { 
          description: 'String (required)',
          duration: 'Number (required, in minutes)',
          date: 'Date (optional, YYYY-MM-DD)'
        },
        response: 'User object with exercise details'
      },
      {
        method: 'GET',
        path: '/api/users/:_id/logs',
        description: 'Get exercise log for a user',
        params: { _id: 'User ID (required)' },
        query: {
          from: 'Date (optional, YYYY-MM-DD)',
          to: 'Date (optional, YYYY-MM-DD)',
          limit: 'Number (optional, limits the number of logs returned)'
        },
        response: 'User object with exercise log array'
      }
    ]
  });
});

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    
    // Validate input
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Check if username already exists
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.json({
        username: existingUser.username,
        _id: existingUser._id
      });
    }
    
    // Create new user
    const newUser = new User({ username: username.trim() });
    await newUser.save();
    
    // Return response in the required format
    res.json({
      username: newUser.username,
      _id: newUser._id
    });
  } catch (err) {
    console.error('Error creating user:', err);
    
    // Handle duplicate key error (unique username)
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: 'Username already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create user. Please try again.' 
    });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id').lean();
    
    // Format the response to ensure consistent structure
    const formattedUsers = users.map(user => ({
      _id: user._id,
      username: user.username
    }));
    
    res.json(formattedUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ 
      error: 'Failed to fetch users. Please try again.' 
    });
  }
});

// Add exercise
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { _id } = req.params;
    let { description, duration, date } = req.body;
    
    // Validate required fields
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    // Validate and convert duration to number
    if (!duration) {
      return res.status(400).json({ error: 'Duration is required' });
    }
    
    duration = parseInt(duration);
    if (isNaN(duration) || duration < 1) {
      return res.status(400).json({ error: 'Duration must be a positive number' });
    }
    
    // Parse date or use current date
    let exerciseDate;
    if (date) {
      exerciseDate = new Date(date);
      if (isNaN(exerciseDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }
    } else {
      exerciseDate = new Date();
    }
    
    // Check if user exists
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create and save exercise
    const exercise = new Exercise({
      userId: _id,
      description: description.trim(),
      duration,
      date: exerciseDate
    });
    
    await exercise.save();
    
    // Format date as required (e.g., "Mon Jan 01 1990")
    const formattedDate = exerciseDate.toDateString();
    
    // Return response in the required format
    res.json({
      _id: user._id,
      username: user.username,
      date: formattedDate,
      duration: exercise.duration,
      description: exercise.description
    });
    
  } catch (err) {
    console.error('Error adding exercise:', err);
    res.status(500).json({ 
      error: 'Failed to add exercise. Please try again.' 
    });
  }
});

// Get exercise log
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params;
    let { from, to, limit } = req.query;
    
    // Check if user exists
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Build query
    let query = { userId: _id };
    let dateFilter = {};
    
    // Parse date filters if provided
    if (from) {
      const fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) {
        return res.status(400).json({ error: 'Invalid "from" date format. Use YYYY-MM-DD' });
      }
      dateFilter.$gte = fromDate;
    }
    
    if (to) {
      const toDate = new Date(to);
      if (isNaN(toDate.getTime())) {
        return res.status(400).json({ error: 'Invalid "to" date format. Use YYYY-MM-DD' });
      }
      // Set time to end of day
      toDate.setHours(23, 59, 59, 999);
      dateFilter.$lte = toDate;
    }
    
    if (from || to) {
      query.date = dateFilter;
    }
    
    // Parse and validate limit
    let limitNum;
    if (limit) {
      limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1) {
        return res.status(400).json({ error: 'Limit must be a positive number' });
      }
    }
    
    // Get exercises with optional limit and sort by date
    let exercisesQuery = Exercise.find(query)
      .select('description duration date -_id')
      .sort({ date: 1 }); // Sort by date ascending
      
    if (limitNum) {
      exercisesQuery = exercisesQuery.limit(limitNum);
    }
    
    const exercises = await exercisesQuery.exec();
    
    // Format response
    const log = exercises.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date.toDateString()
    }));
    
    // Return response in the required format
    res.json({
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log
    });
    
  } catch (err) {
    console.error('Error fetching exercise log:', err);
    res.status(500).json({ 
      error: 'Failed to fetch exercise log. Please try again.' 
    });
  }
});

// Start server
const listener = app.listen(port, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
