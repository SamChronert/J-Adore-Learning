import React from 'react';
import { useUser } from '../contexts/UserContext';
import ProfileIndicator from './ProfileIndicator';

function UserHeader() {
  const { user, logout, isGuest } = useUser();

  if (!user) return null;

  return (
    <div className="absolute top-4 right-4">
      {isGuest ? (
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
          <span className="text-white text-sm">👤 Guest Mode</span>
          <button
            onClick={logout}
            className="text-purple-200 hover:text-white text-sm transition-colors"
          >
            Sign In
          </button>
        </div>
      ) : (
        <ProfileIndicator />
      )}
    </div>
  );
}

export default UserHeader;