import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

function ApiKeyNotification() {
  const { isAuthenticated, getAuthHeaders } = useUser();
  const [hasApiKey, setHasApiKey] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      checkApiKeyStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const checkApiKeyStatus = async () => {
    try {
      const response = await fetch('/api/user/api-key', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasApiKey(data.hasApiKey);
      }
    } catch (error) {
      console.error('Failed to check API key status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Store dismissal in sessionStorage so it doesn't show again this session
    sessionStorage.setItem('sipschool_api_key_notification_dismissed', 'true');
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  // Don't show if: not authenticated, loading, has API key, or dismissed
  if (!isAuthenticated || loading || hasApiKey || isDismissed) {
    return null;
  }

  // Check if already dismissed this session
  if (sessionStorage.getItem('sipschool_api_key_notification_dismissed') === 'true') {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-lg w-full mx-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Add Your Claude API Key
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Get unlimited AI-generated questions by adding your own Claude API key. 
                Questions will be personalized based on your learning progress.
              </p>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleGoToProfile}
                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-md transition-colors"
              >
                Add API Key
              </button>
              <button
                onClick={handleDismiss}
                className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
              >
                Dismiss
              </button>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={handleDismiss}
              className="text-yellow-400 hover:text-yellow-500 focus:outline-none"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyNotification;