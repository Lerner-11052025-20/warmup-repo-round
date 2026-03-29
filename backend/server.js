const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const socketUtil = require('./utils/socket');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socketUtil.init(server);

// ─── Security Middleware ───
app.use(helmet());

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ─── Body Parsers ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Cookie Parser ───
app.use(cookieParser());

// ─── CORS Configuration ───
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── API Routes ───
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const approvalRuleRoutes = require('./routes/approvalRuleRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/approval-rules', approvalRuleRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── Health Check ───
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 SmartFlow Reimburse AI API is running',
    timestamp: new Date().toISOString()
  });
});

// ─── 404 Handler ───
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ─── Global Error Handler ───
app.use(errorHandler);

// ─── Start Server ───
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`\n🚀 SmartFlow Reimburse AI API Server`);
  console.log(`📡 Running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
