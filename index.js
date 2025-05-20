require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const restaurantRoutes = require('./routes/restaurantRoutes');

const port = process.env.PORT;
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { 
    success: false,
    error: 'Too many requests, please try again later.'
  }
});

// More restrictive rate limit for Google Places API
const placesApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Only 30 requests per 15 minutes
  message: {
    success: false,
    error: 'Too many Google Places API requests, please try again later.'
  }
});

// Apply rate limiting to all API routes
// app.use('/api', apiLimiter);

// Apply more restrictive rate limiting to Google Places API endpoints
// app.use('/api/restaurants/fetch', placesApiLimiter);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman or curl with no origin
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());
app.use('/api', restaurantRoutes);

app.get('/test', (req, res) => {
  res.send("MakanMana API is running");
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});
