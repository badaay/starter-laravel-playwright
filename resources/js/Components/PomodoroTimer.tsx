import React, { useState } from 'react';
import { usePomodoro, TimerMode } from '@/Contexts/PomodoroContext';
import { useTheme } from '@/Contexts/ThemeContext';

export default function PomodoroTimer() {
    const { theme } = useTheme();
    const { state, startTimer, pauseTimer, resetTimer, skipTimer, updateSettings } = usePomodoro();
    const [showSettings, setShowSettings] = useState(false);

    const [formSettings, setFormSettings] = useState({
        focus: state.settings.focus,
        shortBreak: state.settings.shortBreak,
        longBreak: state.settings.longBreak,
        longBreakInterval: state.settings.longBreakInterval
    });

    // Format time for display (mm:ss)
    const formatTime = (ms: number) => {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Calculate progress percentage
    const calculateProgress = () => {
        const total = getModeDuration(state.mode) * 60 * 1000;
        return Math.max(0, Math.min(100, ((total - state.timeRemaining) / total) * 100));
    };

    // Get duration based on current mode
    const getModeDuration = (mode: TimerMode): number => {
        switch (mode) {
            case 'focus':
                return state.settings.focus;
            case 'shortBreak':
                return state.settings.shortBreak;
            case 'longBreak':
                return state.settings.longBreak;
        }
    };

    // Mode label for display
    const getModeLabel = (mode: TimerMode): string => {
        switch (mode) {
            case 'focus':
                return 'Focus';
            case 'shortBreak':
                return 'Short Break';
            case 'longBreak':
                return 'Long Break';
        }
    };

    // Mode color for UI
    const getModeColor = (mode: TimerMode): string => {
        switch (mode) {
            case 'focus':
                return theme === 'dark' ? 'bg-red-600' : 'bg-red-500';
            case 'shortBreak':
                return theme === 'dark' ? 'bg-green-600' : 'bg-green-500';
            case 'longBreak':
                return theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500';
        }
    };

    // Background color class
    const getBgColor = (mode: TimerMode): string => {
        switch (mode) {
            case 'focus':
                return theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50';
            case 'shortBreak':
                return theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50';
            case 'longBreak':
                return theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50';
        }
    };

    // Handle settings form submission
    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings({
            focus: parseInt(formSettings.focus.toString(), 10),
            shortBreak: parseInt(formSettings.shortBreak.toString(), 10),
            longBreak: parseInt(formSettings.longBreak.toString(), 10),
            longBreakInterval: parseInt(formSettings.longBreakInterval.toString(), 10)
        });
        setShowSettings(false);
    };

    // Handle mode change
    const changeMode = (mode: TimerMode) => {
        if (state.mode !== mode) {
            updateSettings({ ...state.settings });
            resetTimer();
        }
    };

    return (
        <div className={`rounded-lg shadow-lg transition-all ${getBgColor(state.mode)} p-6 ${showSettings ? 'h-auto' : 'h-auto'}`}>
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pomodoro Timer</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {state.sessionsCompleted} sessions completed
                </p>
            </div>

            {/* Mode selector */}
            <div className="mb-6 grid grid-cols-3 gap-2">
                <button
                    onClick={() => changeMode('focus')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${state.mode === 'focus'
                            ? 'bg-red-500 text-white dark:bg-red-600'
                            : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    Focus
                </button>
                <button
                    onClick={() => changeMode('shortBreak')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${state.mode === 'shortBreak'
                            ? 'bg-green-500 text-white dark:bg-green-600'
                            : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    Short Break
                </button>
                <button
                    onClick={() => changeMode('longBreak')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${state.mode === 'longBreak'
                            ? 'bg-blue-500 text-white dark:bg-blue-600'
                            : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    Long Break
                </button>
            </div>

            {/* Timer circle */}
            <div className="flex justify-center my-8">
                <div className="relative w-56 h-56">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                            strokeWidth="8"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={getModeColor(state.mode).replace('bg-', 'text-').split('/')[0]}
                            strokeWidth="8"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * calculateProgress() / 100)}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <div className="text-4xl font-bold text-gray-800 dark:text-white">
                            {formatTime(state.timeRemaining)}
                        </div>
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {getModeLabel(state.mode)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Timer controls */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                    onClick={state.isRunning ? pauseTimer : startTimer}
                    className={`rounded-md py-2 px-4 font-medium ${
                        state.isRunning
                            ? 'bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700'
                            : 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700'
                    } transition-colors`}
                >
                    {state.isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={resetTimer}
                    className="rounded-md py-2 px-4 font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors"
                >
                    Reset
                </button>
                <button
                    onClick={skipTimer}
                    className="rounded-md py-2 px-4 font-medium bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors"
                >
                    Skip
                </button>
            </div>

            {/* Settings toggle */}
            <div className="text-center mt-4">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    {showSettings ? 'Hide Settings' : 'Show Settings'}
                </button>
            </div>

            {/* Settings form */}
            {showSettings && (
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Timer Settings</h3>
                    <form onSubmit={handleSettingsSubmit}>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Focus Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={formSettings.focus}
                                    onChange={(e) => setFormSettings({...formSettings, focus: parseInt(e.target.value, 10)})}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Short Break Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="15"
                                    value={formSettings.shortBreak}
                                    onChange={(e) => setFormSettings({...formSettings, shortBreak: parseInt(e.target.value, 10)})}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Long Break Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={formSettings.longBreak}
                                    onChange={(e) => setFormSettings({...formSettings, longBreak: parseInt(e.target.value, 10)})}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Long Break Interval (sessions)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formSettings.longBreakInterval}
                                    onChange={(e) => setFormSettings({...formSettings, longBreakInterval: parseInt(e.target.value, 10)})}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-400 dark:focus:border-indigo-400"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowSettings(false)}
                                className="mr-2 rounded-md px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-md px-4 py-2 text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
