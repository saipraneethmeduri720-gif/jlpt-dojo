import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JLPTLevel } from '../types';
import { soundEffects } from '../utils/audio';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Check } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetLevel, setTargetLevel] = useState<JLPTLevel>('n5');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name or nickname.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    soundEffects.playClick();
    const res = await signup(name, email, password, targetLevel);
    setIsLoading(false);

    if (res.success) {
      soundEffects.playSuccessFanfare();
      navigate('/dashboard');
    } else {
      setErrorMessage(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 flex flex-col justify-center items-center p-4 sm:p-6 bg-japanese-pattern">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-japan-indigo-800 text-white shadow-md mb-2">
            <span className="font-japanese font-black text-2xl">達</span>
          </div>
          <h1 className="text-2xl font-black text-japan-charcoal-900 dark:text-zinc-100 tracking-tight">
            Create Your Scholar Profile
          </h1>
          <p className="text-xs text-japan-charcoal-500">
            Start mastering Japanese JLPT levels from N5 to N1 with tailored retention tools
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="washi-card p-6 md:p-8 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-elevated space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold animate-fade-in">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-japan-charcoal-700 dark:text-zinc-300">
                Full Name / Nickname
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-japan-charcoal-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Kenji Sato"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 rounded-xl text-xs text-japan-charcoal-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-japan-indigo-800 focus:border-transparent"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 rounded-xl text-xs text-japan-charcoal-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-japan-indigo-800 focus:border-transparent"
                />
              </div>
            </div>

            {/* Target Level Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-japan-charcoal-700 dark:text-zinc-300">
                Starting Target JLPT Level
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['n5', 'n4', 'n3', 'n2', 'n1'] as JLPTLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTargetLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      targetLevel === lvl
                        ? 'bg-japan-indigo-800 text-white shadow-xs'
                        : 'bg-[#FAF8F5] dark:bg-zinc-800 text-japan-charcoal-700 dark:text-zinc-300 border border-japan-charcoal-200 dark:border-zinc-700'
                    }`}
                  >
                    {lvl.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-japan-charcoal-700 dark:text-zinc-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-japan-charcoal-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF8F5] dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 rounded-xl text-xs text-japan-charcoal-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-japan-indigo-800 focus:border-transparent"
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

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-japan-charcoal-700 dark:text-zinc-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-japan-charcoal-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 rounded-xl text-xs text-japan-charcoal-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-japan-indigo-800 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-japan-indigo-800 hover:bg-japan-indigo-900 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer Link to Login */}
        <div className="text-center text-xs text-japan-charcoal-500">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold text-japan-indigo-800 dark:text-indigo-400 hover:underline ml-1"
          >
            Sign In Here →
          </Link>
        </div>
      </div>
    </div>
  );
};
