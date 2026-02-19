const express = require('express');
const pool = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [topics] = await pool.execute('SELECT * FROM topics');
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:topicId/questions', async (req, res) => {
  try {
    const { topicId } = req.params;
    const [questions] = await pool.execute(
      'SELECT * FROM quiz_questions WHERE topic_id = ?',
      [topicId]
    );
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const topics = [
      { title: 'JavaScript Basics', description: 'Learn fundamental JavaScript concepts', difficulty: 'Easy' },
      { title: 'React Fundamentals', description: 'Introduction to React framework', difficulty: 'Medium' },
      { title: 'Node.js Advanced', description: 'Advanced server-side development', difficulty: 'Hard' }
    ];

    for (const topic of topics) {
      await pool.execute(
        'INSERT IGNORE INTO topics (title, description, difficulty_level) VALUES (?, ?, ?)',
        [topic.title, topic.description, topic.difficulty]
      );
    }

    res.json({ message: 'Topics seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;