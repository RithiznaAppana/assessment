import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const Recommendations = () => {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [recommendation, setRecommendation] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
    fetchHistory();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`${API_URL}/recommendations/${user.id}`);
      setRecommendation(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/recommendations/history/${user.id}`);
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const getDifficultyColor = (adjustment) => {
    switch (adjustment) {
      case 'Increase': return '#e53e3e';
      case 'Decrease': return '#38a169';
      case 'Maintain': return '#3182ce';
      default: return '#718096';
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="container">
          <h2>Generating Personalized Recommendations...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="navbar">
        <h2>AI Recommendations</h2>
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>

      <div className="container">
        {recommendation ? (
          <div>
            <div className="progress-card">
              <h3 style={{ color: '#1a365d', textAlign: 'center', marginBottom: '25px' }}>
                🤖 Your Personalized AI Learning Plan
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center', padding: '15px', background: '#f0f7ff', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: '600' }}>Current Level</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#3182ce', marginTop: '5px' }}>
                    {recommendation.current_level}
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', background: '#f0fff4', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: '600' }}>Next Topic</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#38a169', marginTop: '5px' }}>
                    {recommendation.recommended_topic}
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', background: '#fffaf0', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: '600' }}>Difficulty</div>
                  <div style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: 'bold', 
                    color: getDifficultyColor(recommendation.difficulty_adjustment), 
                    marginTop: '5px' 
                  }}>
                    {recommendation.difficulty_adjustment}
                  </div>
                </div>
              </div>

              <div className="recommendation-explanation">
                <h4>🧠 AI Analysis & Insights</h4>
                <div style={{ marginBottom: '15px' }}>
                  <strong>🎯 Learning Assessment:</strong>
                  <p style={{ marginLeft: '20px', color: '#4a5568', fontStyle: 'italic' }}>
                    "{recommendation.reasoning}"
                  </p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>💡 Recommendation Logic:</strong>
                  <p style={{ marginLeft: '20px', color: '#4a5568', fontStyle: 'italic' }}>
                    "{recommendation.recommendation_reason}"
                  </p>
                </div>
                
                {recommendation.performance_analysis && (
                  <div className="performance-stats">
                    <h5>📊 Performance Analytics Dashboard</h5>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                      gap: '12px', 
                      marginTop: '15px' 
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3182ce' }}>
                          {recommendation.performance_analysis.total_attempts}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>Total Attempts</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3182ce' }}>
                          {recommendation.performance_analysis.average_score}%
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>Average Score</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3182ce' }}>
                          {recommendation.performance_analysis.recent_average}%
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>Recent Performance</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: recommendation.performance_analysis.is_improving ? '#38a169' : '#718096' }}>
                          {recommendation.performance_analysis.is_improving ? '📈 Improving' : '📊 Stable'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>Trend Analysis</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: recommendation.performance_analysis.is_consistent ? '#38a169' : '#d69e2e' }}>
                          {recommendation.performance_analysis.is_consistent ? '✅ Consistent' : '⚠️ Variable'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>Consistency</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38a169' }}>
                          {recommendation.performance_analysis.mastered_topics}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#718096' }}>Topics Mastered</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <h3 style={{ color: '#1a365d', marginTop: '40px', marginBottom: '20px' }}>
              📚 Recommendation History
            </h3>
            {history.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                {history.slice(0, 6).map(rec => (
                  <div key={rec.recommendation_id} className="progress-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <strong style={{ color: '#1a365d' }}>{rec.recommended_topic}</strong>
                      <span style={{ 
                        color: getDifficultyColor(rec.difficulty_adjustment),
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        {rec.difficulty_adjustment}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#718096', margin: 0 }}>
                      📅 {new Date(rec.generated_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="progress-card" style={{ textAlign: 'center', padding: '40px' }}>
                <h4 style={{ color: '#718096' }}>📈 No Previous Recommendations</h4>
                <p style={{ color: '#a0aec0' }}>Complete some quizzes to build your learning history!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="progress-card" style={{ textAlign: 'center', padding: '50px' }}>
            <h3 style={{ color: '#1a365d', marginBottom: '20px' }}>🚀 Ready to Get Started?</h3>
            <p style={{ color: '#718096', marginBottom: '30px', fontSize: '1.1rem' }}>
              Complete some quizzes to unlock your personalized AI recommendations!
            </p>
            <div style={{ margin: '20px 0' }}>
              <span className="achievement-badge">🎯 AI-Powered</span>
              <span className="achievement-badge">📊 Data-Driven</span>
              <span className="achievement-badge">🎓 Personalized</span>
            </div>
            <Link to="/dashboard">
              <button className="btn" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
                🚀 Start Your Learning Journey
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;