# Personalized Learning Progress & Recommendation System

A full-stack learning platform with AI-powered recommendations using React, Node.js, and MySQL.

## Features

- **User Authentication** - Secure login/register system
- **Interactive Quizzes** - Topic-based assessments
- **Progress Tracking** - Visual dashboards and statistics
- **AI Recommendations** - Heuristic-based personalized suggestions
- **Difficulty Adjustment** - Dynamic learning path optimization

## Technology Stack

- **Frontend**: React, React Router, Axios, Chart.js
- **Backend**: Node.js, Express.js, JWT, bcrypt
- **Database**: MySQL
- **AI/ML**: Heuristic-based recommendation engine

## Quick Setup

### Prerequisites
- Node.js (v14+)
- MySQL (v8.0+)
- npm or yarn

### Installation

1. **Clone and Install Dependencies**
```bash
# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install
```

2. **Database Setup**
```sql
CREATE DATABASE learning_platform;
```

3. **Environment Configuration**
```bash
# Copy and edit backend/.env.example to backend/.env
cp backend/.env.example backend/.env
# Update with your MySQL credentials
```

4. **Start Development Servers**
```bash
# Terminal 1 - Backend (Port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (Port 3000)
cd frontend
npm start
```

5. **Initialize Data**
Visit `http://localhost:5000/api/topics/seed` and `http://localhost:5000/api/quiz/seed-questions` to populate sample data.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Topics & Quizzes
- `GET /api/topics` - Get all topics
- `GET /api/topics/:id/questions` - Get topic questions
- `POST /api/quiz/attempt` - Submit quiz attempt
- `GET /api/quiz/progress/:userId` - Get user progress

### AI Recommendations
- `GET /api/recommendations/:userId` - Get AI recommendations
- `GET /api/recommendations/history/:userId` - Get recommendation history

## AI/ML Implementation

The system uses **heuristic-based rules** for generating recommendations:

### Performance Analysis
- Average score < 60% → Decrease difficulty
- Average score > 85% → Increase difficulty
- Scores 60-85% → Maintain current level

### Topic Recommendation Logic
- Poor recent performance → Review failed topics
- Strong performance → Advance to next difficulty level
- Consistent performance → Continue current path

### User Level Classification
- < 50% average → Beginner
- 50-80% average → Intermediate
- > 80% average → Advanced

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy build folder to Vercel
```

### Backend
Deploy to any cloud platform (Heroku, Railway, etc.) with MySQL database.

## Project Structure

```
├── backend/
│   ├── config/          # Database & schema
│   ├── routes/          # API endpoints
│   └── server.js        # Main server
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   └── App.js       # Main app
    └── public/
```

## Assignment Requirements Compliance

✅ **Frontend Requirements**
- Quiz interface ✓
- Progress dashboard ✓
- Recommendations display ✓
- Vercel deployment ready ✓

✅ **Backend Requirements**
- Quiz attempt storage ✓
- Progress metrics calculation ✓
- AI recommendation generation ✓
- REST API endpoints ✓

✅ **Database Design**
- Users table ✓
- Topics table ✓
- Quiz attempts tracking ✓
- Recommendation history ✓

✅ **AI/ML Component**
- Performance clustering logic ✓
- Heuristic-based recommendations ✓
- Difficulty adjustment mechanism ✓
- Expected JSON output format ✓