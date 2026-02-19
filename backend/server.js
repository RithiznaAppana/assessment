const express = require('express');
const cors = require('cors');
const createTables = require('./config/schema');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS for production and development
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://assessment-79db-git-main-rithiznas-projects.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize tables asynchronously (don't block server startup)
if (process.env.NODE_ENV !== 'production') {
  createTables();
} else {
  // In production/serverless, try to create tables but don't block startup
  createTables().catch(err => console.log('Tables may need manual creation:', err.message));
}

const authRoutes = require('./routes/auth');
const topicsRoutes = require('./routes/topics');
const quizRoutes = require('./routes/quiz');
const recommendationsRoutes = require('./routes/recommendations');

app.use('/api/auth', authRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/recommendations', recommendationsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Learning Platform API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});