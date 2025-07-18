import React from 'react';

const HintHistory = ({ attemptCount, hints, currentHint }) => {
  if (attemptCount === 0 || !hints || hints.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-xs font-medium text-gray-600 mb-2">Previous hints:</p>
      <div className="space-y-1">
        {hints.slice(0, attemptCount - 1).map((hint, index) => (
          <p key={index} className="text-xs text-gray-500">
            {index + 1}. {hint}
          </p>
        ))}
      </div>
    </div>
  );
};

export default HintHistory;