const express = require('express');
const pool = require('../config/database');

const router = express.Router();

router.post('/attempt', async (req, res) => {
  try {
    const { userId, topicId, answers } = req.body;
    
    const [questions] = await pool.execute(
      'SELECT question_id, correct_option FROM quiz_questions WHERE topic_id = ?',
      [topicId]
    );
    
    let score = 0;
    const totalQuestions = questions.length;
    
    questions.forEach(question => {
      if (answers[question.question_id] === question.correct_option) {
        score++;
      }
    });
    
    const percentage = (score / totalQuestions) * 100;
    
    const [topic] = await pool.execute(
      'SELECT difficulty_level FROM topics WHERE topic_id = ?',
      [topicId]
    );
    
    await pool.execute(
      'INSERT INTO quiz_attempts (user_id, topic_id, score, total_questions, percentage, difficulty_level) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, topicId, score, totalQuestions, percentage, topic[0].difficulty_level]
    );
    
    res.json({
      score,
      totalQuestions,
      percentage,
      message: 'Quiz completed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [attempts] = await pool.execute(
      `SELECT qa.*, t.title as topic_name 
       FROM quiz_attempts qa 
       JOIN topics t ON qa.topic_id = t.topic_id 
       WHERE qa.user_id = ? 
       ORDER BY qa.attempt_date DESC`,
      [userId]
    );
    
    // Ensure percentage is a number for frontend consumption
    const formattedAttempts = attempts.map(attempt => ({
      ...attempt,
      percentage: Number(attempt.percentage)
    }));
    
    res.json(formattedAttempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/seed-questions', async (req, res) => {
  try {
    const sampleQuestions = [
      {
        topic_id: 1,
        question_text: "What is the correct way to declare a variable in JavaScript?",
        option_a: "var x = 5;",
        option_b: "variable x = 5;",
        option_c: "v x = 5;",
        option_d: "declare x = 5;",
        correct_option: "a",
        difficulty_level: "Easy"
      }
    ];

    for (const q of sampleQuestions) {
      await pool.execute(
        'INSERT IGNORE INTO quiz_questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [q.topic_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.difficulty_level]
      );
    }

    res.json({ message: 'Questions seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;