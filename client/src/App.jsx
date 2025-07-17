import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state for persistence and filtering
  const [userProgress, setUserProgress] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [studyHistory, setStudyHistory] = useState([]);

  // Load progress from localStorage on mount
  useEffect(() => {
    loadUserProgress();
    fetchQuestions();
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    saveUserProgress();
  }, [userProgress, studyHistory]);

  const loadUserProgress = () => {
    try {
      const savedProgress = localStorage.getItem('sipschool_progress');
      const savedHistory = localStorage.getItem('sipschool_history');
      
      if (savedProgress) {
        setUserProgress(JSON.parse(savedProgress));
      }
      
      if (savedHistory) {
        setStudyHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveUserProgress = () => {
    try {
      localStorage.setItem('sipschool_progress', JSON.stringify(userProgress));
      localStorage.setItem('sipschool_history', JSON.stringify(studyHistory));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
      if (!response.ok) throw new Error('Failed to fetch questions');
      
      const questionsData = await response.json();
      setQuestions(questionsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      setLoading(false);
    }
  };

  const getFilteredQuestions = () => {
    if (selectedCategories.length === 0) return questions;
    return questions.filter(q => selectedCategories.includes(q.category));
  };

  const availableCategories = [...new Set(questions.map(q => q.category))];
  const filteredQuestions = getFilteredQuestions();

  const handleAnswer = (isCorrect) => {
    const question = filteredQuestions[currentQuestion];
    
    // Update score
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1
    };
    setScore(newScore);

    // Update user progress
    const questionKey = `q_${question.id}`;
    const attempts = userProgress[questionKey]?.attempts || 0;
    const correctCount = userProgress[questionKey]?.correct || 0;
    
    const updatedProgress = {
      ...userProgress,
      [questionKey]: {
        attempts: attempts + 1,
        correct: correctCount + (isCorrect ? 1 : 0),
        lastAttempt: new Date().toISOString(),
        category: question.category,
        difficulty: question.difficulty
      }
    };
    setUserProgress(updatedProgress);

    // Add to study history
    const historyEntry = {
      questionId: question.id,
      isCorrect,
      timestamp: new Date().toISOString(),
      category: question.category,
      difficulty: question.difficulty
    };
    setStudyHistory(prev => [...prev.slice(-99), historyEntry]); // Keep last 100 entries

    // Move to next question or complete
    if (currentQuestion + 1 >= filteredQuestions.length) {
      setIsComplete(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setShowAnswer(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setShowAnswer(false);
    setScore({ correct: 0, total: 0 });
    setIsComplete(false);
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      const newSelection = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      // Reset quiz when categories change
      if (newSelection.length !== prev.length) {
        setCurrentQuestion(0);
        setShowAnswer(false);
        setScore({ correct: 0, total: 0 });
        setIsComplete(false);
      }
      
      return newSelection;
    });
  };

  const getCategoryStats = () => {
    const stats = {};
    
    availableCategories.forEach(category => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const categoryProgress = categoryQuestions.map(q => userProgress[`q_${q.id}`]).filter(Boolean);
      
      const totalAttempts = categoryProgress.reduce((sum, p) => sum + p.attempts, 0);
      const totalCorrect = categoryProgress.reduce((sum, p) => sum + p.correct, 0);
      const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
      
      stats[category] = {
        questionsAnswered: categoryProgress.length,
        totalQuestions: categoryQuestions.length,
        accuracy: accuracy,
        attempts: totalAttempts
      };
    });
    
    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-red-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading wine questions... 🍷</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-red-800 flex items-center justify-center">
        <div className="text-red-300 text-xl">{error}</div>
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-red-800 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">No questions match your filter</h2>
          <button 
            onClick={() => setSelectedCategories([])}
            className="px-6 py-3 bg-white text-purple-900 rounded-lg font-semibold hover:bg-gray-100"
          >
            Clear Filters
          </button>
        </div>
      </div>
    );
  }

  const categoryStats = getCategoryStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-red-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Progress Stats */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🍷 SipSchool</h1>
          <p className="text-purple-200 mb-4">Master wine knowledge, one sip at a time</p>
          
          {/* Overall Progress */}
          <div className="text-white mb-6">
            <p className="text-lg">
              Session: {score.correct}/{score.total} correct
              {score.total > 0 && ` (${Math.round((score.correct / score.total) * 100)}%)`}
            </p>
            <p className="text-sm text-purple-200">
              Total study sessions: {studyHistory.length}
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-white text-lg mb-3 text-center">Study Categories:</h3>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {availableCategories.map(category => {
              const stats = categoryStats[category];
              const isSelected = selectedCategories.includes(category);
              
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-white text-purple-900 shadow-lg'
                      : 'bg-purple-700 text-white hover:bg-purple-600'
                  }`}
                >
                  {category}
                  {stats.attempts > 0 && (
                    <span className={`ml-1 text-xs ${isSelected ? 'text-purple-600' : 'text-purple-300'}`}>
                      ({stats.accuracy}%)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          {selectedCategories.length > 0 && (
            <div className="text-center">
              <button
                onClick={() => setSelectedCategories([])}
                className="text-purple-300 hover:text-white text-sm underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        {!isComplete ? (
          <div className="max-w-2xl mx-auto">
            {/* Question Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-white mb-2">
                <span>Question {currentQuestion + 1} of {filteredQuestions.length}</span>
                <span className="text-sm">
                  {filteredQuestions[currentQuestion]?.difficulty} • {filteredQuestions[currentQuestion]?.region}
                </span>
              </div>
              <div className="w-full bg-purple-700 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / filteredQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-2xl p-8 mb-6">
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  filteredQuestions[currentQuestion]?.difficulty === 'basic' 
                    ? 'bg-green-100 text-green-800'
                    : filteredQuestions[currentQuestion]?.difficulty === 'intermediate'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {filteredQuestions[currentQuestion]?.category}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {filteredQuestions[currentQuestion]?.question}
              </h2>

              {showAnswer && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <p className="text-gray-800 font-medium">
                    {filteredQuestions[currentQuestion]?.answer}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {!showAnswer ? (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Show Answer
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      ✓ Correct
                    </button>
                    <button
                      onClick={() => handleAnswer(false)}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      ✗ Incorrect
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Completion Screen with Enhanced Stats */
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Session Complete! 🎉
              </h2>
              
              <div className="mb-6">
                <div className="text-6xl font-bold text-purple-600 mb-2">
                  {Math.round((score.correct / score.total) * 100)}%
                </div>
                <p className="text-gray-600">
                  You got {score.correct} out of {score.total} questions correct
                </p>
              </div>

              {/* Category Performance */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Category Performance:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(categoryStats).map(([category, stats]) => (
                    <div key={category} className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-sm text-gray-800">{category}</div>
                      <div className="text-xs text-gray-600">
                        {stats.questionsAnswered}/{stats.totalQuestions} questions
                        {stats.attempts > 0 && ` • ${stats.accuracy}% accuracy`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={resetQuiz}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Study More Questions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;