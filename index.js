require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors')

const restaurantRoutes = require('./routes/restaurantRoutes');

const port = process.env.PORT;
const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];

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
