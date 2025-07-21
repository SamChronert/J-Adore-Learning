import React from 'react';

function HintButton({ onClick, disabled, hasUsedHint }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
        disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : hasUsedHint
          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
      }`}
    >
      <div className="flex items-center justify-center space-x-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>{hasUsedHint ? 'Show Hint Again' : 'Need a Hint?'}</span>
      </div>
    </button>
  );
}

export default HintButton;