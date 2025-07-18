import React, { useState, useEffect } from 'react';
import { UserProvider, useUser } from './contexts/UserContext';
import AuthScreen from './components/AuthScreen';
import UserHeader from './components/UserHeader';
import QuestionCard from './components/QuestionCard';
import './App.css';

function AppContent() {
  const { user, loading: authLoading, isAuthenticated, getAuthHeaders } = useUser();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [showPlacementTest, setShowPlacementTest] = useState(false);
  const [userLevel, setUserLevel] = useState(null);
  
  // State for persistence and filtering
  const [userProgress, setUserProgress] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [studyHistory, setStudyHistory] = useState([]);

  // Answer variations database for intelligent matching
  const answerVariations = {
    'chardonnay': ['chard', 'chardonay', 'chardonney'],
    'cabernet sauvignon': ['cab sauv', 'cabernet', 'cab', 'cabernet-sauvignon'],
    'pinot noir': ['pinot', 'pinot nero'],
    'sauvignon blanc': ['sauv blanc', 'sauvignon', 'blanc'],
    'merlot': ['merlo'],
    'syrah': ['shiraz'],
    'grenache': ['garnacha'],
    'tempranillo': ['tinta roriz', 'aragonez'],
    'sangiovese': ['brunello', 'sangiovese grosso'],
    'nebbiolo': ['spanna', 'chiavennasca'],
    'riesling': ['rhine riesling'],
    'gewurztraminer': ['gewurz', 'traminer'],
    'chenin blanc': ['steen'],
    'malbec': ['cot', 'auxerrois'],
    'zinfandel': ['primitivo', 'zin'],
    'champagne': ['champers'],
    'prosecco': ['proseco'],
    'burgundy': ['bourgogne'],
    'bordeaux': ['bdx'],
    'rhone': ['rhône'],
    'barolo': ['barollo'],
    'chianti': ['chianti classico'],
    'rioja': ['la rioja'],
    'port': ['porto', 'oporto'],
    'sherry': ['jerez', 'xeres'],
    'corvina': ['corvina veronese'],
    'alvarinho': ['albariño'],
    'syrah/shiraz': ['syrah', 'shiraz'],
    'kimmeridgian': ['kimmeridge', 'kimmeridgien']
  };

  // Load progress and questions when user changes
  useEffect(() => {
    if (user) {
      // Check for placement test and load user profile
      if (isAuthenticated) {
        loadUserProfile();
        startNewSession();
      } else {
        setUserLevel(localStorage.getItem('sipschool_level') || 'intermediate');
      }
      
      loadUserProgress();
      fetchQuestions();
    }
  }, [user]);

  // Save progress whenever it changes (for guests only)
  useEffect(() => {
    if (user?.isGuest) {
      saveLocalProgress();
    }
  }, [userProgress, studyHistory]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const profile = await response.json();
        if (!profile.placementCompleted) {
          setShowPlacementTest(true);
        } else {
          setUserLevel(profile.placementLevel || 'intermediate');
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const startNewSession = async () => {
    try {
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const loadUserProgress = async () => {
    if (isAuthenticated) {
      // Load from database
      try {
        const response = await fetch('/api/progress', {
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          const data = await response.json();
          // Convert database progress to local format with spaced repetition data
          const progress = {};
          data.forEach(item => {
            progress[`q_${item.question_id}`] = {
              attempts: item.attempts,
              correct: item.correct_count,
              lastAttempt: item.last_attempt,
              category: item.category,
              difficulty: item.difficulty,
              easeFactor: item.ease_factor || 2.5,
              interval: item.interval || 1,
              nextReview: item.next_review || new Date().toISOString()
            };
          });
          setUserProgress(progress);
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    } else {
      // Load from localStorage for guests
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
        console.error('Error loading local progress:', error);
      }
    }
  };

  const saveLocalProgress = () => {
    try {
      localStorage.setItem('sipschool_progress', JSON.stringify(userProgress));
      localStorage.setItem('sipschool_history', JSON.stringify(studyHistory));
    } catch (error) {
      console.error('Error saving local progress:', error);
    }
  };

  const saveProgressToDatabase = async (questionId, isCorrect, category, difficulty) => {
    if (!isAuthenticated) return;

    try {
      await fetch('/api/progress/update', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          questionId,
          isCorrect,
          category,
          difficulty,
          sessionId,
          easeFactor: userProgress[`q_${questionId}`]?.easeFactor,
          interval: userProgress[`q_${questionId}`]?.interval,
          nextReview: userProgress[`q_${questionId}`]?.nextReview
        })
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
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

  // Normalize answer for comparison
  const normalizeAnswer = (answer) => {
    return answer.toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s\-àâäéèêëïîôùûüÿæœç]/g, '')
      .replace(/\s+/g, ' ');
  };

  // Check if answer is correct with variations
  const checkAnswer = (userAnswer, correctAnswer) => {
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    
    // Exact match
    if (normalizedUser === normalizedCorrect) return true;
    
    // Check if correct answer has known variations
    const correctKey = Object.keys(answerVariations).find(key => 
      normalizeAnswer(key) === normalizedCorrect
    );
    
    if (correctKey && answerVariations[correctKey]) {
      return answerVariations[correctKey].some(variation => 
        normalizeAnswer(variation) === normalizedUser
      );
    }
    
    // Check if user answer is a key with variations
    const userKey = Object.keys(answerVariations).find(key => 
      normalizeAnswer(key) === normalizedUser
    );
    
    if (userKey && userKey === correctAnswer.toLowerCase()) {
      return true;
    }
    
    // Check for multiple acceptable answers (e.g., "Pauillac, Margaux, Saint-Estèphe...")
    if (correctAnswer.includes(',') || correctAnswer.includes(' or ')) {
      const acceptableAnswers = correctAnswer.split(/,| or /).map(a => normalizeAnswer(a.trim()));
      return acceptableAnswers.some(answer => answer === normalizedUser);
    }
    
    // Partial match for longer answers (at least 80% of words match)
    const userWords = normalizedUser.split(' ');
    const correctWords = normalizedCorrect.split(' ');
    
    if (correctWords.length > 2) {
      const matchingWords = correctWords.filter(word => 
        userWords.includes(word)
      );
      return matchingWords.length / correctWords.length >= 0.8;
    }
    
    return false;
  };

  // Generate hint based on answer and attempt count
  const generateHint = (question, attemptNumber) => {
    // First check if question has custom hints
    if (question.hints && question.hints[attemptNumber]) {
      return question.hints[attemptNumber];
    }
    
    // Generate progressive hints based on answer and question type
    const answer = question.answer;
    const answerLength = answer.length;
    const firstLetter = answer[0].toUpperCase();
    const words = answer.split(' ');
    
    // Hint Level 1: Contextual/Educational hint
    if (attemptNumber === 0) {
      // Category-specific educational hints
      switch (question.category) {
        case 'Wine Regions':
          if (question.region) {
            return `Think about the key characteristics of ${question.region}. What makes this region unique in the wine world?`;
          }
          return `Consider the country, climate, and wine styles associated with this region.`;
          
        case 'Grape Varieties':
          if (words.length > 1) {
            return `This is a ${words.length}-word answer. Think about grape varieties that might be hyphenated or have multiple parts.`;
          }
          return `This grape variety starts with "${firstLetter}". Consider if it's a red or white grape based on the context.`;
          
        case 'Winemaking':
          return `Think about the winemaking process mentioned. What technique or term is commonly used in this context?`;
          
        case 'Viticulture':
          return `Consider the vineyard practices or growing conditions. The answer relates to how grapes are cultivated.`;
          
        case 'Wine Service':
          return `Think about proper wine service etiquette or temperature. What's the professional standard here?`;
          
        case 'Food Pairing':
          return `Consider the flavors and textures. What wine characteristic would complement this dish?`;
          
        default:
          return `The answer has ${answerLength} letters and starts with "${firstLetter}". Think about the context of the question.`;
      }
    }
    
    // Hint Level 2: Structural hint
    else if (attemptNumber === 1) {
      if (words.length > 1) {
        const wordLengths = words.map(w => w.length).join('-');
        return `It's ${words.length} words with this pattern: ${wordLengths} letters. The first word starts with "${firstLetter}".`;
      } else if (answer.match(/[éèêëàâäôöûü]/)) {
        return `This is a ${answerLength}-letter word starting with "${firstLetter}". Note: it contains accented characters.`;
      } else {
        const vowelCount = answer.match(/[aeiou]/gi)?.length || 0;
        return `Single word: ${answerLength} letters, starts with "${firstLetter}", contains ${vowelCount} vowels.`;
      }
    }
    
    // Hint Level 3: Revealing hint
    else {
      if (words.length > 1) {
        // For multi-word answers, reveal first word
        return `The answer begins with "${words[0]}..." (${words.length} words total)`;
      } else if (answer.length > 6) {
        // For long single words, show first 3-4 letters
        const revealLength = Math.min(4, Math.floor(answer.length / 2));
        return `The answer begins with "${answer.substring(0, revealLength)}..." (${answerLength} letters total)`;
      } else {
        // For short words, show first and last letter with blanks
        const blanks = '_'.repeat(Math.max(1, answer.length - 2));
        return `The answer is: ${firstLetter}${blanks}${answer[answer.length - 1]}`;
      }
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      setFeedback('Please enter an answer');
      return;
    }

    const question = getNextQuestion();
    const isCorrect = checkAnswer(userAnswer, question.answer);
    
    if (isCorrect) {
      setScore({ ...score, correct: score.correct + 1, total: score.total + 1 });
      setShowAnswer(true);
      setShowHint(false);
      setCurrentHint('');
      setFeedback('Correct! Well done! 🎉');
      updateProgress(question.id, true, attemptCount + 1);
      
      // Auto-advance after 2 seconds for correct answers
      setTimeout(() => {
        handleNext();
      }, 2000);
    } else {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      if (newAttemptCount === 1) {
        setFeedback('Not quite right. Here\'s a hint to help you!');
        const hint = generateHint(question, 0);
        setCurrentHint(hint);
        setShowHint(true);
      } else if (newAttemptCount === 2) {
        setFeedback('Still not right. Here\'s another hint:');
        const hint = generateHint(question, 1);
        setCurrentHint(hint);
        setShowHint(true);
      } else if (newAttemptCount === 3) {
        setFeedback('Last chance! Here\'s a big hint:');
        const hint = generateHint(question, 2);
        setCurrentHint(hint);
        setShowHint(true);
      } else if (newAttemptCount >= 4) {
        setFeedback('Let me show you the answer:');
        setShowAnswer(true);
        setShowHint(false);
        setCurrentHint('');
        setScore({ ...score, total: score.total + 1 });
        updateProgress(question.id, false, newAttemptCount);
      }
      
      // Clear the input for another attempt
      if (!showAnswer) {
        setUserAnswer('');
      }
    }
  };

  // Update progress with spaced repetition
  const updateProgress = (questionId, isCorrect, attempts) => {
    const questionKey = `q_${questionId}`;
    const existingProgress = userProgress[questionKey] || {
      attempts: 0,
      correct: 0,
      lastAttempt: null,
      easeFactor: 2.5,
      interval: 1
    };
    
    const newProgress = {
      ...existingProgress,
      attempts: existingProgress.attempts + 1,
      correct: existingProgress.correct + (isCorrect ? 1 : 0),
      lastAttempt: new Date().toISOString()
    };
    
    // Spaced repetition algorithm (SM-2 inspired)
    if (isCorrect) {
      if (attempts === 1) {
        // Perfect recall
        newProgress.interval = Math.min(existingProgress.interval * existingProgress.easeFactor, 180);
        newProgress.easeFactor = Math.min(existingProgress.easeFactor + 0.1, 3.0);
      } else {
        // Recalled with hints
        newProgress.interval = Math.max(1, existingProgress.interval * 0.8);
        newProgress.easeFactor = Math.max(existingProgress.easeFactor - 0.1, 1.3);
      }
    } else {
      // Failed to recall
      newProgress.interval = 1;
      newProgress.easeFactor = Math.max(existingProgress.easeFactor - 0.3, 1.3);
    }
    
    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + Math.round(newProgress.interval));
    newProgress.nextReview = nextReview.toISOString();
    
    const updatedProgress = { ...userProgress, [questionKey]: newProgress };
    setUserProgress(updatedProgress);
    
    // Update study history
    const historyEntry = {
      questionId,
      isCorrect,
      timestamp: new Date().toISOString(),
      category: questions.find(q => q.id === questionId)?.category,
      difficulty: questions.find(q => q.id === questionId)?.difficulty,
      attempts
    };
    
    setStudyHistory(prev => [...prev.slice(-99), historyEntry]);
    
    // Save to database if authenticated
    if (isAuthenticated) {
      saveProgressToDatabase(questionId, isCorrect, historyEntry.category, historyEntry.difficulty);
    }
  };

  // Get next question based on spaced repetition
  const getNextQuestion = () => {
    const filteredQuestions = getFilteredQuestions();
    if (filteredQuestions.length === 0) return null;
    
    if (currentQuestion >= filteredQuestions.length) {
      return filteredQuestions[0];
    }
    
    // In a full implementation, this would prioritize based on review dates
    // For now, return the current question in sequence
    return filteredQuestions[currentQuestion];
  };

  const getFilteredQuestions = () => {
    if (selectedCategories.length === 0) return questions;
    return questions.filter(q => selectedCategories.includes(q.category));
  };

  const handleNext = () => {
    const filteredQuestions = getFilteredQuestions();
    
    setShowAnswer(false);
    setUserAnswer('');
    setAttemptCount(0);
    setShowHint(false);
    setCurrentHint('');
    setFeedback('');
    
    if (currentQuestion + 1 >= filteredQuestions.length) {
      setIsComplete(true);
      if (isAuthenticated && sessionId) {
        endSession();
      }
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showAnswer) {
      handleSubmitAnswer();
    } else if (e.key === 'Enter' && showAnswer) {
      handleNext();
    }
  };

  const endSession = async () => {
    if (!sessionId || !isAuthenticated) return;

    try {
      const categoriesStudied = [...new Set(studyHistory.map(h => h.category))];
      await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          questionsAnswered: score.total,
          correctAnswers: score.correct,
          categoriesStudied
        })
      });
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setShowAnswer(false);
    setUserAnswer('');
    setAttemptCount(0);
    setShowHint(false);
    setCurrentHint('');
    setFeedback('');
    setScore({ correct: 0, total: 0 });
    setIsComplete(false);
    if (isAuthenticated) {
      startNewSession();
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => {
      const newSelection = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      // Reset quiz when categories change
      if (newSelection.length !== prev.length) {
        resetQuiz();
      }
      
      return newSelection;
    });
  };

  const getCategoryStats = () => {
    const stats = {};
    const availableCategories = [...new Set(questions.map(q => q.category))];
    
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

  // Placement Test Component
  const PlacementTest = ({ onComplete }) => {
    const [testQuestions, setTestQuestions] = useState([]);
    const [testIndex, setTestIndex] = useState(0);
    const [testScore, setTestScore] = useState(0);
    const [testAnswer, setTestAnswer] = useState('');
    const [showTestFeedback, setShowTestFeedback] = useState(false);
    
    useEffect(() => {
      // Select placement test questions
      const basic = questions.filter(q => q.difficulty === 'basic').slice(0, 7);
      const intermediate = questions.filter(q => q.difficulty === 'intermediate').slice(0, 8);
      const advanced = questions.filter(q => q.difficulty === 'advanced').slice(0, 5);
      
      const placementQuestions = [...basic, ...intermediate, ...advanced]
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);
      
      setTestQuestions(placementQuestions);
    }, []);
    
    const handleTestSubmit = () => {
      if (!testAnswer.trim()) return;
      
      const isCorrect = checkAnswer(testAnswer, testQuestions[testIndex].answer);
      if (isCorrect) {
        setTestScore(testScore + 1);
      }
      
      setShowTestFeedback(true);
      
      setTimeout(() => {
        if (testIndex < testQuestions.length - 1) {
          setTestIndex(testIndex + 1);
          setTestAnswer('');
          setShowTestFeedback(false);
        } else {
          // Calculate level
          const percentage = (testScore / 20) * 100;
          const level = percentage < 35 ? 'beginner' : percentage < 70 ? 'intermediate' : 'advanced';
          
          // Save results
          localStorage.setItem('sipschool_level', level);
          localStorage.setItem('sipschool_placement_completed', 'true');
          localStorage.setItem('sipschool_placement_score', testScore.toString());
          
          onComplete(level, testScore);
        }
      }, 1500);
    };
    
    if (testQuestions.length === 0) {
      return <div className="text-white text-center">Preparing placement test...</div>;
    }
    
    const currentQ = testQuestions[testIndex];
    
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Placement Test</h2>
            <p className="text-gray-600">Question {testIndex + 1} of 20</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-gradient-to-r from-purple-600 to-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((testIndex + 1) / 20) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-xl text-gray-800 mb-4">{currentQ.question}</p>
            
            {showTestFeedback ? (
              <div className="mb-4">
                <p className="text-lg font-medium text-gray-700">
                  Correct answer: {currentQ.answer}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={testAnswer}
                  onChange={(e) => setTestAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTestSubmit()}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleTestSubmit}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Submit Answer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-red-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading... 🍷</div>
      </div>
    );
  }

  // Show auth screen if no user
  if (!user) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

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

  // Show placement test if needed
  if (showPlacementTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-red-800 py-8">
        <PlacementTest onComplete={(level, score) => {
          setUserLevel(level);
          setShowPlacementTest(false);
          alert(`Placement complete! Your level: ${level} (Score: ${score}/20)`);
        }} />
      </div>
    );
  }

  const filteredQuestions = getFilteredQuestions();
  const categoryStats = getCategoryStats();
  const availableCategories = [...new Set(questions.map(q => q.category))];

  if (filteredQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-red-800 relative">
        <UserHeader />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
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
      </div>
    );
  }

  const currentQ = getNextQuestion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-red-800 relative">
      <UserHeader />
      
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
              {isAuthenticated 
                ? `Welcome back, ${user.username}! Level: ${userLevel || 'Intermediate'}`
                : 'Guest Mode - Sign in to save progress'
              }
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
                  {currentQ?.difficulty} • {currentQ?.region}
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
            <QuestionCard
              question={currentQ}
              userAnswer={userAnswer}
              setUserAnswer={setUserAnswer}
              showAnswer={showAnswer}
              showHint={showHint}
              currentHint={currentHint}
              feedback={feedback}
              attemptCount={attemptCount}
              onSubmit={handleSubmitAnswer}
              onNext={handleNext}
              onGiveUp={() => {
                setShowAnswer(true);
                setShowHint(false);
                setCurrentHint('');
                setFeedback('Here\'s the answer:');
                setScore({ ...score, total: score.total + 1 });
                updateProgress(currentQ.id, false, attemptCount);
              }}
              onKeyPress={handleKeyPress}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryStats).slice(0, 4).map(([category, stats]) => (
                <div key={category} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <h4 className="text-sm font-medium text-white/80 mb-1">{category}</h4>
                  <p className="text-2xl font-bold text-white">{stats.accuracy}%</p>
                  <p className="text-xs text-white/60">{stats.questionsAnswered}/{stats.totalQuestions}</p>
                </div>
              ))}
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

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;