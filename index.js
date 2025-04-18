require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors')

const restaurantRoutes = require('./routes/restaurantRoutes');

const port = process.env.PORT;
const cors_origin = process.env.CORS_ORIGIN;

app.use(cors({
    origin: cors_origin,
  }
));
app.use(express.json());
app.use('/api', restaurantRoutes);

app.get('/test', (req, res) => {
  res.send("MakanMana API is running");
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});
