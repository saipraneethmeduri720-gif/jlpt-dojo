import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { soundEffects } from '../utils/audio';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    soundEffects.playClick();
    const res = await login(email, password, rememberMe);
    setIsLoading(false);

    if (res.success) {
      soundEffects.playSuccessFanfare();
      navigate('/dashboard');
    } else {
      setErrorMessage(res.error || 'Failed to login.');
    }
  };

  const handleDemoLogin = () => {
    soundEffects.playClick();
    demoLogin('n5');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 flex flex-col justify-center items-center p-4 sm:p-6 bg-japanese-pattern">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-japan-indigo-800 text-white shadow-md mb-2">
            <span className="font-japanese font-black text-2xl">日</span>
          </div>
          <h1 className="text-2xl font-black text-japan-charcoal-900 dark:text-zinc-100 tracking-tight">
            日本語道場 • JLPT Mastery
          </h1>
          <p className="text-xs text-japan-charcoal-500">
            Sign in to access your persistent Japanese study records & quizzes
          </p>
        </div>

        {/* Card Form */}
        <div className="washi-card p-6 md:p-8 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-elevated space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold animate-fade-in">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-japan-charcoal-700 dark:text-zinc-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-japan-charcoal-400" />
                <input
                  type="email"
                  required
                  placeholder="scholar@jlptmastery.jp"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 rounded-xl text-xs text-japan-charcoal-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-japan-indigo-800 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-japan-charcoal-700 dark:text-zinc-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your registered email.')}
                  className="text-[11px] text-japan-indigo-800 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-japan-charcoal-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8F5] dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 rounded-xl text-xs text-japan-charcoal-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-japan-indigo-800 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-japan-charcoal-400 hover:text-japan-charcoal-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-japan-charcoal-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-japan-charcoal-300 text-japan-indigo-800 focus:ring-japan-indigo-800"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-japan-indigo-800 hover:bg-japan-indigo-900 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-2 border-t border-japan-charcoal-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-zinc-800 hover:bg-japan-indigo-50 dark:hover:bg-zinc-700 text-japan-charcoal-800 dark:text-zinc-200 border border-japan-charcoal-200 dark:border-zinc-700 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-japan-vermilion-500" />
              <span>Explore Instant Demo Mode</span>
            </button>
          </div>
        </div>

        {/* Footer Link to Sign Up */}
        <div className="text-center text-xs text-japan-charcoal-500">
          Don't have an account yet?{' '}
          <Link
            to="/signup"
            className="font-bold text-japan-indigo-800 dark:text-indigo-400 hover:underline ml-1"
          >
            Create an Account →
          </Link>
        </div>
      </div>
    </div>
  );
};
