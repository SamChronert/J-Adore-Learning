import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';
import HintButton from './HintButton';

const QuestionCard = ({
  question,
  userAnswer,
  setUserAnswer,
  showAnswer,
  showHint,
  currentHint,
  feedback,
  hasAttempted,
  hasUsedHint,
  onSubmit,
  onNext,
  onHintRequest,
  onKeyPress
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const getFeedbackStyle = () => {
    if (feedback.includes('Correct')) return 'bg-green-50 text-green-700 border-green-200';
    if (feedback.includes('correct answer')) return 'bg-red-50 text-red-700 border-red-200';
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
        <div className="flex items-center gap-2">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDifficultyStyle()}`}>
            {question?.category}
          </span>
          {question?.generated && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Generated
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!showAnswer && !hasAttempted && (
            <span className="text-sm text-gray-500">
              Single attempt only
            </span>
          )}
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Provide feedback"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Question Text */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {question?.question}
      </h2>

      {/* Hint Display */}
      {showHint && currentHint && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <span className="text-blue-600 mr-2">💡</span>
            <div className="flex-1">
              <p className="text-sm text-blue-700 font-medium mb-1">
                Hint:
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
              disabled={hasAttempted}
            />
            {!hasAttempted && (
              <p className="text-xs text-gray-500 mt-1">Press Enter to submit</p>
            )}
          </div>
          
          {/* Hint Button - Show before attempt */}
          {!hasAttempted && (
            <HintButton
              onClick={onHintRequest}
              disabled={false}
              hasUsedHint={hasUsedHint}
            />
          )}
          
          {/* Submit Button - Disabled after attempt */}
          <button
            onClick={onSubmit}
            disabled={!userAnswer.trim() || hasAttempted}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              userAnswer.trim() && !hasAttempted
                ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {hasAttempted ? 'Answer Submitted' : 'Submit Answer'}
          </button>
        </div>
      )}

      {/* Status Indicator */}
      {hasAttempted && !showAnswer && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Processing your answer...
        </div>
      )}
      
      {/* Feedback Modal */}
      <FeedbackModal
        question={question}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
};

export default QuestionCard;