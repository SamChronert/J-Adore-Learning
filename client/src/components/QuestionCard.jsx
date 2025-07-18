import React from 'react';

const QuestionCard = ({
  question,
  userAnswer,
  setUserAnswer,
  showAnswer,
  showHint,
  currentHint,
  feedback,
  attemptCount,
  onSubmit,
  onNext,
  onGiveUp,
  onKeyPress
}) => {
  const maxAttempts = 4;
  const attemptsLeft = maxAttempts - attemptCount;

  const getFeedbackStyle = () => {
    if (feedback.includes('Correct')) return 'bg-green-50 text-green-700 border-green-200';
    if (feedback.includes('show you')) return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  const getDifficultyStyle = () => {
    switch (question?.difficulty) {
      case 'basic':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 mb-6">
      {/* Question Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDifficultyStyle()}`}>
          {question?.category}
        </span>
        {!showAnswer && attemptCount > 0 && (
          <span className="text-sm text-gray-500">
            {attemptsLeft > 0 ? `${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left` : 'Last chance!'}
          </span>
        )}
      </div>
      
      {/* Question Text */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {question?.question}
      </h2>

      {/* Progressive Hint Display */}
      {showHint && !showAnswer && currentHint && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <span className="text-blue-600 mr-2">💡</span>
            <div className="flex-1">
              <p className="text-sm text-blue-700 font-medium mb-1">
                Hint {attemptCount} of 3:
              </p>
              <p className="text-sm text-blue-700">{currentHint}</p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Display */}
      {feedback && (
        <div className={`mb-4 p-3 rounded-lg border ${getFeedbackStyle()}`}>
          <p className="text-sm font-medium">{feedback}</p>
        </div>
      )}

      {/* Answer Display */}
      {showAnswer ? (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <p className="text-sm text-purple-600 font-medium mb-1">Correct Answer:</p>
            <p className="text-gray-800 font-medium text-lg">
              {question?.answer}
            </p>
          </div>
          
          {question?.explanation && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Learn more:</strong> {question?.explanation}
              </p>
            </div>
          )}
          
          <button
            onClick={onNext}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors transform hover:scale-105"
          >
            Next Question →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Answer Input */}
          <div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-all duration-200"
              autoFocus
              disabled={showAnswer}
            />
            {attemptCount === 0 && (
              <p className="text-xs text-gray-500 mt-1">Press Enter to submit</p>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            onClick={onSubmit}
            disabled={!userAnswer.trim()}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              userAnswer.trim()
                ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Answer
          </button>
          
          {/* Give Up Button - Only show after first attempt */}
          {attemptCount > 0 && !showAnswer && (
            <button
              onClick={onGiveUp}
              className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm underline"
            >
              I give up - show me the answer
            </button>
          )}
        </div>
      )}

      {/* Visual Progress Indicator */}
      {!showAnswer && attemptCount > 0 && (
        <div className="mt-4 flex justify-center space-x-2">
          {[...Array(maxAttempts)].map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-all duration-300 ${
                index < attemptCount
                  ? 'bg-red-400'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;