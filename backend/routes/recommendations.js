const express = require('express');
const pool = require('../config/database');

const router = express.Router();

const generateRecommendations = async (userId) => {
  try {
    const [attempts] = await pool.execute(
      `SELECT qa.*, t.title as topic_name, t.difficulty_level as topic_difficulty 
       FROM quiz_attempts qa 
       JOIN topics t ON qa.topic_id = t.topic_id 
       WHERE qa.user_id = ? 
       ORDER BY qa.attempt_date DESC 
       LIMIT 20`,
      [userId]
    );

    if (attempts.length === 0) {
      return {
        recommended_topic: "JavaScript Basics",
        difficulty_adjustment: "Maintain",
        current_level: "Beginner",
        reasoning: "New user - starting with basics"
      };
    }

    const processedAttempts = attempts.map(attempt => ({
      ...attempt,
      percentage: Number(attempt.percentage)
    }));

    // Advanced Heuristic Analysis
    const totalAttempts = processedAttempts.length;
    const avgPercentage = processedAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts;
    const recentAttempts = processedAttempts.slice(0, 5);
    const recentAvg = recentAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / recentAttempts.length;
    
    // Performance Trend Analysis (Heuristic)
    const oldAttempts = processedAttempts.slice(5, 10);
    const oldAvg = oldAttempts.length > 0 ? 
      oldAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / oldAttempts.length : recentAvg;
    const isImproving = recentAvg > oldAvg + 5; // 5% improvement threshold
    const isDecreasing = recentAvg < oldAvg - 5; // 5% decline threshold

    // Consistency Analysis (Heuristic)
    const variance = recentAttempts.reduce((sum, attempt) => 
      Math.pow(attempt.percentage - recentAvg, 2), 0) / recentAttempts.length;
    const isConsistent = variance < 100; // Low variance = consistent performance

    // Topic Mastery Analysis (Heuristic)
    const topicPerformance = {};
    processedAttempts.forEach(attempt => {
      if (!topicPerformance[attempt.topic_name]) {
        topicPerformance[attempt.topic_name] = [];
      }
      topicPerformance[attempt.topic_name].push(attempt.percentage);
    });

    const masteredTopics = Object.entries(topicPerformance)
      .filter(([topic, scores]) => {
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return avgScore > 80 && scores.length >= 2;
      })
      .map(([topic, scores]) => topic);

    const strugglingTopics = Object.entries(topicPerformance)
      .filter(([topic, scores]) => {
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return avgScore < 60;
      })
      .map(([topic, scores]) => topic);

    // Difficulty Adjustment Heuristics
    let difficultyAdjustment;
    let reasoning = "";

    if (isDecreasing && !isConsistent) {
      difficultyAdjustment = "Decrease";
      reasoning = "Performance declining with inconsistency - reducing difficulty to build confidence";
    } else if (isImproving && isConsistent && avgPercentage > 85) {
      difficultyAdjustment = "Increase";
      reasoning = "Consistent improvement with high scores - ready for challenge";
    } else if (strugglingTopics.length > masteredTopics.length) {
      difficultyAdjustment = "Decrease";
      reasoning = "More struggling topics than mastered - focusing on fundamentals";
    } else if (masteredTopics.length >= 2 && avgPercentage > 75) {
      difficultyAdjustment = "Increase";
      reasoning = "Multiple topics mastered with good average - advancing difficulty";
    } else {
      difficultyAdjustment = "Maintain";
      reasoning = "Steady progress - maintaining current difficulty level";
    }

    // Level Classification Heuristics
    let currentLevel;
    if (avgPercentage >= 80 && masteredTopics.length >= 3) {
      currentLevel = "Advanced";
    } else if (avgPercentage >= 60 && (masteredTopics.length >= 1 || isImproving)) {
      currentLevel = "Intermediate";
    } else {
      currentLevel = "Beginner";
    }

    // Topic Recommendation Heuristics
    const [allTopics] = await pool.execute('SELECT * FROM topics ORDER BY difficulty_level');
    let recommendedTopic;
    let recommendationReason = "";

    // Priority 1: Address struggling topics
    if (strugglingTopics.length > 0) {
      recommendedTopic = strugglingTopics[0] + " (Review)";
      recommendationReason = "Focusing on previously challenging topic for mastery";
    }
    // Priority 2: Continue with next logical progression
    else if (masteredTopics.length > 0) {
      const nextDifficultyMap = {
        "Beginner": "Easy",
        "Intermediate": "Medium", 
        "Advanced": "Hard"
      };
      
      const nextDifficulty = nextDifficultyMap[currentLevel];
      const nextTopic = allTopics.find(t => 
        t.difficulty_level === nextDifficulty && 
        !masteredTopics.includes(t.title)
      );
      
      recommendedTopic = nextTopic ? nextTopic.title : "Advanced Project Work";
      recommendationReason = `Progressing to ${nextDifficulty.toLowerCase()} level topics based on current mastery`;
    }
    // Priority 3: Start with appropriate level
    else {
      const startingDifficulty = currentLevel === "Advanced" ? "Hard" : 
                               currentLevel === "Intermediate" ? "Medium" : "Easy";
      const startingTopic = allTopics.find(t => t.difficulty_level === startingDifficulty);
      recommendedTopic = startingTopic ? startingTopic.title : "JavaScript Basics";
      recommendationReason = `Starting with ${startingDifficulty.toLowerCase()} topics appropriate for ${currentLevel.toLowerCase()} level`;
    }

    await pool.execute(
      'UPDATE users SET current_level = ? WHERE user_id = ?',
      [currentLevel, userId]
    );

    const recommendation = {
      user_id: userId,
      recommended_topic: recommendedTopic,
      difficulty_adjustment: difficultyAdjustment,
      current_level: currentLevel,
      reasoning: reasoning,
      recommendation_reason: recommendationReason,
      performance_analysis: {
        total_attempts: totalAttempts,
        average_score: Math.round(avgPercentage),
        recent_average: Math.round(recentAvg),
        is_improving: isImproving,
        is_consistent: isConsistent,
        mastered_topics: masteredTopics.length,
        struggling_topics: strugglingTopics.length
      }
    };

    await pool.execute(
      'INSERT INTO recommendations (user_id, recommended_topic, difficulty_adjustment) VALUES (?, ?, ?)',
      [userId, recommendedTopic, difficultyAdjustment]
    );

    return recommendation;
  } catch (error) {
    throw error;
  }
};

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const recommendation = await generateRecommendations(userId);
    res.json({
      student_id: `U${userId}`,
      ...recommendation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [recommendations] = await pool.execute(
      'SELECT * FROM recommendations WHERE user_id = ? ORDER BY generated_at DESC',
      [userId]
    );
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;