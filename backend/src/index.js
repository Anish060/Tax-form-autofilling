require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const extractionRoutes = require('./routes/extraction');
const taxRoutes = require('./routes/tax');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/extract', extractionRoutes);
app.use('/api/tax', taxRoutes);

// sync DB
async function start() {
  await sequelize.authenticate();
  await sequelize.sync(); // use migrations in prod
  const port = process.env.PORT || 8081;
  app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });
}
start().catch(err => console.error(err));
