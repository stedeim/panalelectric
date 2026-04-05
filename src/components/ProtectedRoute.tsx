import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, subscription } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-5xl mb-4">⚡</div>
          <div className="text-amber-400 font-bold text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If no active subscription, redirect to upgrade
  if (subscription.status === 'none' || subscription.tier === 'none') {
    return <Navigate to="/upgrade" replace />;
  }

  return <>{children}</>;
}
