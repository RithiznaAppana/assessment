import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to construct URL without double slashes
const buildApiUrl = (endpoint) => {
  const baseUrl = API_URL.replace(/\/+$/, ''); // Remove trailing slashes
  const cleanEndpoint = endpoint.replace(/^\/+/, ''); // Remove leading slashes
  return `${baseUrl}/${cleanEndpoint}`;
};

const Dashboard = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [topics, setTopics] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchTopics();
    fetchProgress();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTopics = async () => {
    try {
      const response = await axios.get(buildApiUrl('topics'));
      setTopics(response.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await axios.get(buildApiUrl(`quiz/progress/${user.id}`));
      setAttempts(response.data);
      
      const avgScore = response.data.length > 0 
        ? response.data.reduce((sum, attempt) => sum + attempt.percentage, 0) / response.data.length
        : 0;

      setStats({
        totalAttempts: response.data.length,
        averageScore: avgScore.toFixed(1),
        topicsAttempted: new Set(response.data.map(a => a.topic_id)).size
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="App">
      <div className="navbar">
        <h2>Learning Dashboard</h2>
        <div>
          <Link to="/recommendations">Get Recommendations</Link>
          <button onClick={logout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <div className="container">
        <h3>Welcome back, {user.name}!</h3>
        <p>Current Level: <strong>{user.currentLevel}</strong></p>

        <div className="stats">
          <div className="stat-item">
            <div className="stat-number">{stats.totalAttempts}</div>
            <div className="stat-label">Quizzes Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.averageScore}%</div>
            <div className="stat-label">Average Score</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(stats.averageScore || 0, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.topicsAttempted}</div>
            <div className="stat-label">Topics Explored</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <span className="achievement-badge">
            🎯 Level: {user.currentLevel}
          </span>
          {stats.averageScore >= 80 && (
            <span className="achievement-badge">
              🏆 High Performer
            </span>
          )}
          {stats.topicsAttempted >= 3 && (
            <span className="achievement-badge">
              🌟 Explorer
            </span>
          )}
        </div>

        <h3>🎯 Available Learning Topics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {topics.map(topic => {
            const getDifficultyClass = (level) => {
              switch(level?.toLowerCase()) {
                case 'easy': return 'difficulty-easy';
                case 'medium': return 'difficulty-medium';
                case 'hard': return 'difficulty-hard';
                default: return 'difficulty-medium';
              }
            };
            
            return (
              <div key={topic.topic_id} className="progress-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0 }}>{topic.title}</h4>
                  <span className={`difficulty-badge ${getDifficultyClass(topic.difficulty_level)}`}>
                    {topic.difficulty_level}
                  </span>
                </div>
                <p style={{ color: '#718096', marginBottom: '20px' }}>{topic.description}</p>
                <Link to={`/quiz/${topic.topic_id}`}>
                  <button className="btn" style={{ width: '100%' }}>
                    🚀 Start Learning
                  </button>
                </Link>
              </div>
            );
          })}
        </div>

        <h3>📈 Recent Performance</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
          {attempts.slice(0, 6).map(attempt => (
            <div key={attempt.attempt_id} className="progress-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>{attempt.topic_name}</h4>
                <span className={Number(attempt.percentage) >= 70 ? 'success' : 'warning'}>
                  {Number(attempt.percentage).toFixed(1)}%
                </span>
              </div>
              <p style={{ margin: '5px 0', color: '#718096', fontSize: '0.9rem' }}>
                Score: {attempt.score}/{attempt.total_questions}
              </p>
              <p style={{ margin: '5px 0', color: '#718096', fontSize: '0.8rem' }}>
                📅 {new Date(attempt.attempt_date).toLocaleDateString()}
              </p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min(Number(attempt.percentage) || 0, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;