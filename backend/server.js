require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const logger = require('./config/logger');
const apiLimiter = require('./middleware/rateLimitMiddleware');
const errorHandler = require('./middleware/errorMiddleware');
const startSchedulers = require('./services/schedulerService');
const { razorpayWebhook } = require('./controllers/billController');
const { ensureDefaultSocietyAndAttachUsers } = require('./services/defaultSocietyService');

const authRoutes = require('./routes/authRoutes');
const societyRoutes = require('./routes/societyRoutes');
const userRoutes = require('./routes/userRoutes');
const flatRoutes = require('./routes/flatRoutes');
const billRoutes = require('./routes/billRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const staffRoutes = require('./routes/staffRoutes');
const accountRoutes = require('./routes/accountRoutes');
const amenityRoutes = require('./routes/amenityRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const assetRoutes = require('./routes/assetRoutes');

const app = express();

// CORS configuration - allow multiple origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed (also check for Vercel preview URLs)
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    callback(null, true); // Allow all origins for now (debugging)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(helmet());
app.use(morgan('dev'));
app.use(apiLimiter);

app.post('/api/bills/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.status(200).json({ message: 'Society Management API', status: 'running' }));
app.get('/health', (req, res) => res.status(200).json({ message: 'SMS API running' }));

app.use('/api/auth', authRoutes);
app.use('/api/societies', societyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/flats', flatRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/assets', assetRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await ensureDefaultSocietyAndAttachUsers();
    startSchedulers();
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  } catch (error) {
    logger.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();
