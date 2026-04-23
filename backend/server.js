require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({ 
  origin: FRONTEND_URL, 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser()); // Required for csurf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session Configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// CSRF Protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// In-memory storage (Mock seeding)
const users = [
  {
    username: 'photolover',
    password: bcrypt.hashSync('password123', 10)
  }
];
const posts = [
  {
    id: 1,
    username: 'photolover',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop',
    caption: 'Welcome to my minimal Instagram clone with CSRF Protection! 📸',
    timestamp: new Date()
  }
];

// Multer Setup for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Session Middleware
const authenticateSession = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: No session' });
  }
};

// CSRF Token Route
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  const existingUser = users.find(u => u.username === username);
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: 'User created' });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = { username };
    res.json({ message: 'Login successful', username });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'No active session' });
  }
});

// Feed Route
app.get('/api/feed', (req, res) => {
  res.json(posts);
});

// Profile Route
app.get('/api/profile/:username', (req, res) => {
  const { username } = req.params;
  const userPosts = posts.filter(p => p.username === username);
  res.json({
    username,
    posts: userPosts,
    postCount: userPosts.length
  });
});

// Upload Route
app.post('/api/upload', authenticateSession, upload.single('image'), (req, res) => {
  const { caption } = req.body;
  if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

  const newPost = {
    id: posts.length + 1,
    username: req.session.user.username,
    imageUrl: `/uploads/${req.file.filename}`,
    caption,
    timestamp: new Date(),
  };

  posts.unshift(newPost);
  res.status(201).json(newPost);
});

// Error handling for CSRF errors
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  res.status(403).json({ message: 'Invalid CSRF token' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
