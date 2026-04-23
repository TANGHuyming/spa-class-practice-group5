require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET || "fallback_secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser()); // Required for csurf

// Session Configuration
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);

// CSRF Protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// In-memory storage (Mock seeding)
let csrfToken = "";
const users = [
  {
    username: 'user',
    password: bcrypt.hashSync('user', 10),
    contacts: [
      {
        id: 1,
        name: "Alex Rivera",
        tel: "+1-555-010-2345",
        description:
          "Senior software architect specializing in distributed systems and cloud infrastructure.",
        timestamp: new Date(),
      },
      {
        id: 2,
        name: "Samantha Chen",
        tel: "+1-555-012-3456",
        description:
          "Freelance graphic designer and illustrator with a focus on minimalist branding.",
        timestamp: new Date(),
      },
      {
        id: 3,
        name: "Jordan Smith",
        tel: "+1-555-014-5678",
        description:
          "Project manager for the regional sustainability initiative and urban planning committee.",
        timestamp: new Date(),
      },
      {
        id: 4,
        name: "Dr. Elena Vance",
        tel: "+1-555-016-7890",
        description:
          "Lead researcher in renewable energy technologies and energy storage solutions.",
        timestamp: new Date(),
      },
      {
        id: 5,
        name: "Marcus Thorne",
        tel: "+1-555-018-9012",
        description:
          "Customer success lead responsible for high-value enterprise accounts in the APAC region.",
        timestamp: new Date(),
      },
    ]
  },
];
// const contacts = [
//   {
//     id: 1,
//     name: 'the person this number belongs to',
//     tel: 'phone number of this person',
//     description: 'description about the person',
//     timestamp: new Date()
//   }
// ];

// Session Middleware
const authenticateSession = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: No session" });
  }
};

const authenticateCsrf = (req, res, next) => {
  const userCsrfToken = req.get("x-csrf-token");

  if (!csrfToken || csrfToken !== userCsrfToken) {
    res.status(401).json({ message: "No CSRF included" });
  }

  next();
};

// CSRF Token Route
app.get("/api/csrf-token", (req, res) => {
  csrfToken = req.csrfToken();
  res.json({ csrfToken });
});

// Auth Routes
app.post("/api/auth/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  const existingUser = users.find((u) => u.username === username);
  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: "User created" });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = { username };
    res.json({ message: "Login successful", username });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ message: "Logout successful" });
  });
});

app.get("/api/auth/me", (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: "No active session" });
  }
});

// get contact endpoint
app.get('/api/contacts', authenticateSession, (req, res) => {
  const { username } = req.session.user;
  const context = users.find(u => u.username === username).contacts;
  return res.status(200).json(context);
});

// add contact endpoint
app.post('/api/addContact', authenticateSession, authenticateCsrf, (req, res) => {
  const { name, tel, caption } = req.body;
  const { username } = req.session.user;

  const newContact = {
    id: contacts.length + 1,
    name,
    tel: String(tel),
    description: caption,
    timestamp: new Date(),
  };

  const userWithNewContacts = users.find(u => u.username === username);
  userWithNewContacts.contacts.push(newContact);

  const id = users.findIndex(u => u.username === username);
  users.splice(id, 1);

  users.push(userWithNewContacts);

  res.status(201).json(newContact);
});

// Error handling for CSRF errors
app.use((err, req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  res.status(403).json({ message: "Invalid CSRF token" });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
