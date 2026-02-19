import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Quiz = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [topicId]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API_URL}/topics/${topicId}/questions`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAnswerSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption) {
      setAnswers({
        ...answers,
        [questions[currentQuestion].question_id]: selectedOption
      });

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption('');
      } else {
        submitQuiz();
      }
    }
  };

  const submitQuiz = async () => {
    try {
      const finalAnswers = {
        ...answers,
        [questions[currentQuestion].question_id]: selectedOption
      };

      const response = await axios.post(`${API_URL}/quiz/attempt`, {
        userId: user.id,
        topicId: parseInt(topicId),
        answers: finalAnswers
      });

      setResult(response.data);
      setQuizCompleted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="App">
        <div className="container">
          <h2>Loading Quiz...</h2>
          <p>If this takes too long, the topic might not have questions yet.</p>
          <button onClick={() => navigate('/dashboard')} className="btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Number(result.percentage);
    const isExcellent = percentage >= 90;
    const isGood = percentage >= 70;
    const isPass = percentage >= 50;

    return (
      <div className="App">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2>🎊 Quiz Completed!</h2>
            <p style={{ color: '#718096', fontSize: '1.1rem' }}>
              {isExcellent ? 'Outstanding performance!' : 
               isGood ? 'Great job!' : 
               isPass ? 'Good effort, keep improving!' : 'Keep practicing!'}
            </p>
          </div>

          <div className="progress-card" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#1a365d', marginBottom: '20px' }}>✨ Your Results</h3>
            
            <div className="stats" style={{ margin: '20px 0' }}>
              <div className="stat-item">
                <div className="stat-number">{result.score}</div>
                <div className="stat-label">Correct Answers</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{result.totalQuestions}</div>
                <div className="stat-label">Total Questions</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{percentage.toFixed(1)}%</div>
                <div className="stat-label">Final Score</div>
              </div>
            </div>

            <div className="progress-bar" style={{ margin: '20px 0' }}>
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>

            <div style={{ margin: '20px 0' }}>
              {isExcellent && <span className="achievement-badge">🏆 Excellent</span>}
              {isGood && <span className="achievement-badge">🌟 Well Done</span>}
              {isPass && <span className="achievement-badge">✅ Passed</span>}
            </div>

            <p className={percentage >= 70 ? 'success' : 'warning'} style={{ fontSize: '1.1rem', margin: '20px 0' }}>
              {percentage >= 70 ? '🎉 Congratulations! You\'re making excellent progress!' : 
               '📚 Keep studying and you\'ll improve quickly!'}
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button onClick={() => navigate('/dashboard')} className="btn" style={{ margin: '10px' }}>
              🏠 Back to Dashboard
            </button>
            <button onClick={() => navigate('/recommendations')} className="btn" style={{ margin: '10px' }}>
              🤖 Get AI Recommendations
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="App">
      <div className="container">
        <div className="quiz-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2>📚 Knowledge Assessment</h2>
          <p style={{ color: '#718096', marginBottom: '20px' }}>
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <div className="progress-bar" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#a0aec0', marginTop: '10px' }}>
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
          </p>
        </div>

        <div className="progress-card">
          <h3 style={{ color: '#1a365d', marginBottom: '25px' }}>{question.question_text}</h3>
          
          <div className="quiz-options">
            {['a', 'b', 'c', 'd'].map(option => (
              <button
                key={option}
                className={`quiz-option ${selectedOption === option ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(option)}
              >
                {option.toUpperCase()}: {question[`option_${option}`]}
              </button>
            ))}
          </div>

          <div className="quiz-controls" style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={handleNext}
              disabled={!selectedOption}
              className="btn"
              style={{ 
                width: '200px', 
                opacity: selectedOption ? 1 : 0.5,
                cursor: selectedOption ? 'pointer' : 'not-allowed'
              }}
            >
              {currentQuestion === questions.length - 1 ? '🎯 Submit Quiz' : '➡️ Next Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;