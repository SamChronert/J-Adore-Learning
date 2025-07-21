import React, { useState } from 'react';
import AuthForm from './AuthForm';
import { useUser } from '../contexts/UserContext';

function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const { continueAsGuest, login } = useUser();

  const handleAuthSuccess = (user, token) => {
    login(user, token);
    onAuthSuccess();
  };

  const handleGuestMode = () => {
    continueAsGuest();
    onAuthSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-red-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🍷 SipSchool</h1>
          <p className="text-purple-200 text-lg">Master wine knowledge, one sip at a time</p>
        </div>

        <AuthForm mode={mode} onSuccess={handleAuthSuccess} />

        <div className="mt-6 text-center">
          <p className="text-purple-200 mb-2">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-white font-semibold hover:text-purple-200 transition-colors"
          >
            {mode === 'login' ? 'Create Account' : 'Sign In'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-300 opacity-30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-purple-900 to-red-800 text-purple-200">or</span>
            </div>
          </div>
          
          <button
            onClick={handleGuestMode}
            className="mt-4 text-purple-200 hover:text-white transition-colors"
          >
            Continue as Guest →
          </button>
          <p className="text-purple-300 text-xs mt-2">
            (Progress won't be saved)
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;