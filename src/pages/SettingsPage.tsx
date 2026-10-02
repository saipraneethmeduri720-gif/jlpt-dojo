import React, { useState, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useProgress } from '../context/ProgressContext';
import { soundEffects } from '../utils/audio';
import { Modal } from '../components/common/Modal';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Check,
  Target,
  Clock,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, toggleSound, toggleTheme } = useSettings();
  const { exportProgressJSON, importProgressJSON, resetAllProgress } = useProgress();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [importErrorMsg, setImportErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    soundEffects.playClick();
    const dataStr = exportProgressJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jlpt-progress-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportSuccessMsg(null);
    setImportErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = importProgressJSON(text);
        if (success) {
          soundEffects.playSuccessFanfare();
          setImportSuccessMsg('Progress data imported successfully!');
        } else {
          setImportErrorMsg('Failed to parse JLPT progress file.');
        }
      } catch (err) {
        setImportErrorMsg('Invalid file format. Please upload a valid JSON backup.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmReset = () => {
    soundEffects.playClick();
    resetAllProgress();
    setIsResetModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="washi-card p-6 md:p-8 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-elevated">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-japan-indigo-50 dark:bg-zinc-800 text-japan-indigo-800 dark:text-indigo-400 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-japan-charcoal-900 dark:text-zinc-100">
              Application Settings & Preferences
            </h1>
            <p className="text-xs text-japan-charcoal-500">
              Customize your learning experience, sound, study targets, and data backups
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="space-y-6">
        {/* Appearance & Sound */}
        <div className="washi-card p-6 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-japan-charcoal-800 dark:text-zinc-200">
            Appearance & Audio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Theme Toggle */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-zinc-800/80 border border-japan-charcoal-200/80 dark:border-zinc-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-japan-charcoal-900 dark:text-zinc-100">
                  Color Theme
                </div>
                <div className="text-[11px] text-japan-charcoal-500">
                  Switch between Minimalist Light & Dark mode
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-700 border border-japan-charcoal-200 dark:border-zinc-600 text-xs font-semibold shadow-xs"
              >
                {settings.theme === 'dark' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>

            {/* Sound Effects Toggle */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-zinc-800/80 border border-japan-charcoal-200/80 dark:border-zinc-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-japan-charcoal-900 dark:text-zinc-100">
                  Audio Feedback & Chimes
                </div>
                <div className="text-[11px] text-japan-charcoal-500">
                  Web Audio feedback for quizzes and actions
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  settings.soundEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                }`}
              >
                {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{settings.soundEnabled ? 'Enabled' : 'Muted'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Study Goals & Defaults */}
        <div className="washi-card p-6 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-japan-charcoal-800 dark:text-zinc-200">
            Study Goals & Quiz Defaults
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Daily Minutes Goal */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-zinc-800/80 border border-japan-charcoal-200/80 dark:border-zinc-700 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-japan-charcoal-900 dark:text-zinc-100">
                <Clock className="w-3.5 h-3.5 text-japan-indigo-800" />
                <span>Daily Time Goal</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="180"
                  step="5"
                  value={settings.dailyStudyGoalMinutes}
                  onChange={(e) => updateSettings({ dailyStudyGoalMinutes: parseInt(e.target.value) || 20 })}
                  className="w-20 px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-900 border border-japan-charcoal-200 dark:border-zinc-700 rounded-xl"
                />
                <span className="text-xs text-japan-charcoal-500">minutes / day</span>
              </div>
            </div>

            {/* Daily New Items Goal */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-zinc-800/80 border border-japan-charcoal-200/80 dark:border-zinc-700 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-japan-charcoal-900 dark:text-zinc-100">
                <Target className="w-3.5 h-3.5 text-japan-indigo-800" />
                <span>New Items Target</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.dailyNewItemsGoal}
                  onChange={(e) => updateSettings({ dailyNewItemsGoal: parseInt(e.target.value) || 10 })}
                  className="w-20 px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-900 border border-japan-charcoal-200 dark:border-zinc-700 rounded-xl"
                />
                <span className="text-xs text-japan-charcoal-500">items / day</span>
              </div>
            </div>

            {/* Default Quiz Question Count */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-zinc-800/80 border border-japan-charcoal-200/80 dark:border-zinc-700 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-japan-charcoal-900 dark:text-zinc-100">
                <Sparkles className="w-3.5 h-3.5 text-japan-indigo-800" />
                <span>Default Quiz Count</span>
              </div>
              <select
                value={settings.defaultQuizCount}
                onChange={(e) => updateSettings({ defaultQuizCount: parseInt(e.target.value) || 20 })}
                className="w-full px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-900 border border-japan-charcoal-200 dark:border-zinc-700 rounded-xl"
              >
                <option value={10}>10 Questions</option>
                <option value={20}>20 Questions</option>
                <option value={30}>30 Questions</option>
                <option value={50}>50 Questions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Persistence, Backup & Restore */}
        <div className="washi-card p-6 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-japan-charcoal-800 dark:text-zinc-200">
            Data Persistence, Export & Import
          </h2>
          <p className="text-xs text-japan-charcoal-500">
            Your learning progress, quiz history, and streaks are safely stored locally in your browser. You can export your progress file anytime to transfer across devices or backup your study records.
          </p>

          {importSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{importSuccessMsg}</span>
            </div>
          )}

          {importErrorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{importErrorMsg}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {/* Export JSON button */}
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-japan-indigo-800 hover:bg-japan-indigo-900 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Progress (JSON)</span>
            </button>

            {/* Import JSON button */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 text-japan-charcoal-800 dark:text-zinc-200 text-xs font-semibold hover:bg-japan-charcoal-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import Backup</span>
            </button>

            {/* Reset Progress button */}
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors ml-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Progress</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            <span>Reset All Learning Progress?</span>
          </div>
        }
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-japan-charcoal-600 dark:text-zinc-300 leading-relaxed">
            Are you sure you want to reset all learned items, quiz history, and review queues? This action cannot be undone unless you have exported a JSON backup.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-japan-charcoal-200 dark:border-zinc-700 text-japan-charcoal-700 dark:text-zinc-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm"
            >
              Yes, Reset Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
