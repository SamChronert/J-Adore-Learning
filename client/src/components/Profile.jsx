import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, isAuthenticated, getAuthHeaders, loading: authLoading } = useUser();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Wait for auth loading to complete
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    // Load profile data
    const loadData = async () => {
      setProfileLoading(true);
      await Promise.all([loadProfile(), loadStats(), checkApiKey()]);
      setProfileLoading(false);
    };
    
    loadData();
  }, [isAuthenticated, authLoading, navigate]);

  const loadProfile = async () => {
    try {
      console.log('Loading profile with headers:', getAuthHeaders());
      const response = await fetch('/api/user/profile', {
        headers: getAuthHeaders()
      });
      console.log('Profile response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        setProfile(data);
      } else {
        console.error('Profile response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        // Set a default profile to prevent infinite loading
        setProfile({
          username: user?.username || 'Unknown',
          email: user?.email || '',
          placementLevel: 'intermediate',
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Set a default profile to prevent infinite loading
      setProfile({
        username: user?.username || 'Unknown',
        email: user?.email || '',
        placementLevel: 'intermediate',
        createdAt: new Date().toISOString()
      });
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Stats response not OK:', response.status);
        // Set default stats to prevent errors
        setStats({
          totalQuestions: 0,
          overallAccuracy: 0,
          streak: 0,
          sessionsCompleted: 0
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Set default stats to prevent errors
      setStats({
        totalQuestions: 0,
        overallAccuracy: 0,
        streak: 0,
        sessionsCompleted: 0
      });
    }
  };

  const checkApiKey = async () => {
    try {
      const response = await fetch('/api/user/api-key/status', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setHasApiKey(data.hasApiKey || false);
      }
    } catch (error) {
      console.error('Failed to check API key status:', error);
      setHasApiKey(false);
    }
  };

  const handleSaveApiKey = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/api-key', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ apiKey })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'API key saved successfully!' });
        setShowApiKey(false);
        setHasApiKey(true);
        setApiKey(''); // Clear the input
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to save API key' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetProgress = async () => {
    if (!window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/progress/reset', {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Progress reset successfully!' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset progress' });
    }
  };

  // Show loading while auth is checking
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-red-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  // This shouldn't happen if loadProfile sets a default, but just in case
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-red-800 flex items-center justify-center">
        <div className="text-white text-xl">Error loading profile. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-red-800 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-white hover:text-purple-200 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Questions
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile Settings</h1>

            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* User Info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Username</label>
                  <p className="text-lg text-gray-800">{profile.username}</p>
                </div>
                {profile.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg text-gray-800">{profile.email}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-600">Level</label>
                  <p className="text-lg text-gray-800 capitalize">{profile.placementLevel || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Member Since</label>
                  <p className="text-lg text-gray-800">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">API Key Status</label>
                  <p className="text-lg text-gray-800">
                    {hasApiKey ? (
                      <span className="text-green-600 font-medium">✓ Configured</span>
                    ) : (
                      <span className="text-orange-600 font-medium">Not configured</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* API Key Management */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Claude API Key</h2>
              <p className="text-gray-600 mb-4">
                Add your own Claude API key to get unlimited AI-generated questions personalized to your learning needs.
              </p>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-api..."
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleSaveApiKey}
                  disabled={saving || !apiKey.trim()}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    saving || !apiKey.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save API Key'}
                </button>
                <p className="text-sm text-gray-500">
                  Get your API key from{' '}
                  <a 
                    href="https://console.anthropic.com/settings/keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 underline"
                  >
                    Anthropic Console
                  </a>
                </p>
              </div>
            </div>

            {/* Learning Statistics */}
            {stats && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Learning Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-600">{stats.totalQuestions || 0}</p>
                    <p className="text-sm text-gray-600">Questions Answered</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.overallAccuracy || 0}%</p>
                    <p className="text-sm text-gray-600">Overall Accuracy</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">{stats.streak || 0}</p>
                    <p className="text-sm text-gray-600">Day Streak</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-yellow-600">{stats.sessionsCompleted || 0}</p>
                    <p className="text-sm text-gray-600">Sessions</p>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
              <button
                onClick={handleResetProgress}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset All Progress
              </button>
              <p className="text-sm text-gray-500 mt-2">
                This will permanently delete all your learning progress and statistics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;