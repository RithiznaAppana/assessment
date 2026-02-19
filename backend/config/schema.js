const pool = require('./database');

const createTables = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Test connection first
      await pool.execute('SELECT 1');
      
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          current_level ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.execute(`
        CREATE TABLE IF NOT EXISTS topics (
          topic_id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          difficulty_level ENUM('Easy', 'Medium', 'Hard') NOT NULL
        )
      `);

      await pool.execute(`
        CREATE TABLE IF NOT EXISTS quiz_questions (
          question_id INT AUTO_INCREMENT PRIMARY KEY,
          topic_id INT NOT NULL,
          question_text TEXT NOT NULL,
          option_a VARCHAR(255) NOT NULL,
          option_b VARCHAR(255) NOT NULL,
          option_c VARCHAR(255) NOT NULL,
          option_d VARCHAR(255) NOT NULL,
          correct_option CHAR(1) NOT NULL,
          difficulty_level ENUM('Easy', 'Medium', 'Hard') NOT NULL,
          FOREIGN KEY (topic_id) REFERENCES topics(topic_id)
        )
      `);

      await pool.execute(`
        CREATE TABLE IF NOT EXISTS quiz_attempts (
          attempt_id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          topic_id INT NOT NULL,
          score INT NOT NULL,
          total_questions INT NOT NULL,
          percentage DECIMAL(5,2) NOT NULL,
          difficulty_level ENUM('Easy', 'Medium', 'Hard') NOT NULL,
          attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id),
          FOREIGN KEY (topic_id) REFERENCES topics(topic_id)
        )
      `);

      await pool.execute(`
        CREATE TABLE IF NOT EXISTS recommendations (
          recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          recommended_topic VARCHAR(255) NOT NULL,
          difficulty_adjustment ENUM('Increase', 'Decrease', 'Maintain') NOT NULL,
          generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
      `);

      console.log('All tables created successfully');
      return; // Success, exit retry loop
    } catch (error) {
      console.error(`Error creating tables (attempt ${i + 1}/${retries}):`, error.message);
      if (i === retries - 1) {
        console.error('Failed to create tables after all retries');
        // Don't throw error in serverless environment, just log it
        if (process.env.NODE_ENV === 'production') {
          console.log('Database tables may need to be created manually');
          return;
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  }
};

module.exports = createTables;