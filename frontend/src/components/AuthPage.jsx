import React, { useState } from 'react';
import axios from 'axios';
import { Shield, Key, Mail, User, AlertCircle } from 'lucide-react';

function AuthPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        // Register flow
        await axios.post('/api/auth/register', { name, email, password, role });
        setSuccessMsg('Registration successful! Please login.');
        setIsRegister(false);
        // Clear fields
        setName('');
        setPassword('');
      } else {
        // Login flow
        const response = await axios.post('/api/auth/login', { email, password });
        onLogin(response.data.token, response.data.user);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden transition-all duration-300">
        
        {/* Header section */}
        <div className="bg-indigo-600 px-8 py-10 text-white text-center relative">
          <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">IT Helpdesk System</h2>
          <p className="text-indigo-100 text-sm mt-1">
            {isRegister ? 'Create your employee or agent account' : 'Sign in to manage your support tickets'}
          </p>
        </div>

        {/* Form section */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start space-x-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg flex items-start space-x-2 text-sm animate-pulse">
              <span>{successMsg}</span>
            </div>
          )}

          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-150 text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-150 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Key className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-150 text-sm"
              />
            </div>
          </div>

          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">System Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-150 text-sm capitalize"
              >
                <option value="employee">Employee (Submit & View Tickets)</option>
                <option value="agent">IT Agent (Assign & Solve Tickets)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors duration-150 shadow-md shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Footer / Toggle mode */}
        <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 text-center text-xs text-slate-500">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                className="text-indigo-600 hover:underline font-semibold"
              >
                Sign In
              </button>
            </p>
          ) : (
            <div className="space-y-2">
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setIsRegister(true);
                    setError('');
                  }}
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Create one here
                </button>
              </p>
              <div className="border-t border-slate-200/60 my-2 pt-2">
                <span className="font-semibold block text-[10px] uppercase text-slate-400 tracking-widest mb-1">Demo Credentials</span>
                <div className="flex justify-center gap-3 text-[10px] text-slate-400">
                  <div>
                    <span className="font-medium text-slate-500">Employee:</span> employee@helpdesk.com / employee123
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Agent:</span> agent@helpdesk.com / agent123
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AuthPage;
