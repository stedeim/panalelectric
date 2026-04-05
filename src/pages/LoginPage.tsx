import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
        navigate('/dashboard');
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccess('Check your email for a reset link.');
        setMode('login');
      } else {
        await signUp(email, password);
        navigate('/upgrade');
      }
    } catch (err: any) {
      const msgs: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many attempts. Please try again.',
      };
      setError(msgs[err.code] || 'Something went wrong. Try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">⚡</div>
          <h1 className="text-3xl font-black text-white">Electrician<span className="text-amber-400">Pro</span></h1>
          <p className="text-slate-400 mt-1">Members Portal</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-black text-slate-900 mb-6 text-center">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="your@email.com" required />
            </div>
            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Your password" required />
              </div>
            )}
            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-600 text-sm">{success}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-amber-400 text-slate-900 font-black py-3 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </form>
          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('reset')} className="text-sm text-slate-500 hover:text-amber-500 block w-full">Forgot password?</button>
                <span className="text-sm text-slate-500">No account? </span>
                <button onClick={() => setMode('signup')} className="text-sm font-semibold text-amber-500 hover:text-amber-600">Sign up free</button>
              </>
            )}
            {(mode === 'signup' || mode === 'reset') && (
              <button onClick={() => setMode('login')} className="text-sm font-semibold text-slate-500 hover:text-amber-500">Back to sign in</button>
            )}
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            Don't have a subscription?{' '}
            <a href="https://panelelectric.io/subscribe" className="text-amber-400 font-semibold hover:underline">View plans</a>
          </p>
        </div>
        <p className="text-center text-slate-600 text-xs mt-4">© 2026 ElectricianPro — Built for electricians, by electricians ⚡</p>
      </div>
    </div>
  );
}
