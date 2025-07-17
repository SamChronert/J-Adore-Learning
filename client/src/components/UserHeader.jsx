import React from 'react';
import { useUser } from '../contexts/UserContext';

function UserHeader() {
  const { user, logout, isGuest } = useUser();

  if (!user) return null;

  return (
    <div className="absolute top-4 right-4 flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
      <span className="text-white text-sm">
        {isGuest ? '👤 Guest Mode' : `🍷 ${user.username}`}
      </span>
      <button
        onClick={logout}
        className="text-purple-200 hover:text-white text-sm transition-colors"
      >
        {isGuest ? 'Sign In' : 'Logout'}
      </button>
    </div>
  );
}

export default UserHeader;