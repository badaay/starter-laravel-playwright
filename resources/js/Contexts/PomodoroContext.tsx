import React, { createContext, useContext, useEffect, useState } from 'react';
import { savePomodoroSession } from '@/api/pomodoro';

// Timer modes
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

// Settings for the timer in minutes
interface TimerSettings {
    focus: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
}

// Timer state
interface PomodoroState {
    isRunning: boolean;
    mode: TimerMode;
    timeRemaining: number;
    sessionsCompleted: number;
    settings: TimerSettings;
}

// Context interface
interface PomodoroContextType {
    state: PomodoroState;
    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    skipTimer: () => void;
    updateSettings: (settings: Partial<TimerSettings>) => void;
}

// Default settings
const defaultSettings: TimerSettings = {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4
};

// Create context
const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

// Helper to get timer duration in milliseconds
function getTimerDuration(mode: TimerMode, settings: TimerSettings): number {
    switch (mode) {
        case 'focus':
            return settings.focus * 60 * 1000;
        case 'shortBreak':
            return settings.shortBreak * 60 * 1000;
        case 'longBreak':
            return settings.longBreak * 60 * 1000;
    }
}

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
    // Load user settings from localStorage or use defaults
    const [settings, setSettings] = useState<TimerSettings>(() => {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
            try {
                return JSON.parse(savedSettings);
            } catch (e) {
                return defaultSettings;
            }
        }
        return defaultSettings;
    });

    // Initialize timer state
    const [state, setState] = useState<PomodoroState>({
        isRunning: false,
        mode: 'focus',
        timeRemaining: getTimerDuration('focus', settings),
        sessionsCompleted: 0,
        settings: settings
    });

    // Timer interval
    const [timer, setTimer] = useState<number | null>(null);

    // Update settings in localStorage when changed
    useEffect(() => {
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        // Reset time remaining when settings change
        if (!state.isRunning) {
            setState(prevState => ({
                ...prevState,
                timeRemaining: getTimerDuration(prevState.mode, settings),
                settings
            }));
        } else {
            setState(prevState => ({ ...prevState, settings }));
        }
    }, [settings]);

    // Timer tick effect
    useEffect(() => {
        if (state.isRunning) {
            const interval = window.setInterval(() => {
                setState(prevState => {
                    if (prevState.timeRemaining <= 1000) {
                        // Time's up - handle completion
                        clearInterval(interval);

                        // Play sound notification
                        const audio = new Audio('/sounds/timer-end.mp3');
                        audio.play().catch(e => console.log('Audio play failed', e));

                        // Show browser notification if possible
                        if ('Notification' in window && Notification.permission === 'granted') {
                            const title = prevState.mode === 'focus'
                                ? 'Focus session completed! Take a break.'
                                : 'Break time over! Ready to focus?';

                            new Notification(title);
                        }

                        // Save the session to the database
                        const sessionDuration = prevState.mode === 'focus'
                            ? prevState.settings.focus * 60
                            : prevState.mode === 'shortBreak'
                                ? prevState.settings.shortBreak * 60
                                : prevState.settings.longBreak * 60;

                        const startTime = new Date(Date.now() - sessionDuration * 1000);

                        savePomodoroSession({
                            type: prevState.mode,
                            duration: sessionDuration,
                            completed: true,
                            startedAt: startTime,
                            completedAt: new Date(),
                        }).catch(e => console.error('Failed to save Pomodoro session', e));

                        let nextMode: TimerMode;
                        let sessionsCompleted = prevState.sessionsCompleted;

                        // Determine next mode based on current mode
                        if (prevState.mode === 'focus') {
                            sessionsCompleted++;
                            nextMode = sessionsCompleted % prevState.settings.longBreakInterval === 0
                                ? 'longBreak'
                                : 'shortBreak';
                        } else {
                            nextMode = 'focus';
                        }

                        // Set up next timer
                        return {
                            ...prevState,
                            isRunning: false,
                            mode: nextMode,
                            timeRemaining: getTimerDuration(nextMode, prevState.settings),
                            sessionsCompleted,
                        };
                    }

                    // Normal countdown
                    return {
                        ...prevState,
                        timeRemaining: prevState.timeRemaining - 1000
                    };
                });
            }, 1000);

            setTimer(interval);
            return () => clearInterval(interval);
        }
    }, [state.isRunning]);

    // Handle timer actions
    const startTimer = () => {
        setState(prevState => ({ ...prevState, isRunning: true }));
    };

    const pauseTimer = () => {
        setState(prevState => ({ ...prevState, isRunning: false }));
    };

    const resetTimer = () => {
        setState(prevState => ({
            ...prevState,
            isRunning: false,
            timeRemaining: getTimerDuration(prevState.mode, prevState.settings)
        }));
    };

    const skipTimer = () => {
        let nextMode: TimerMode;
        let sessionsCompleted = state.sessionsCompleted;

        // Determine next mode based on current mode
        if (state.mode === 'focus') {
            sessionsCompleted++;
            nextMode = sessionsCompleted % state.settings.longBreakInterval === 0
                ? 'longBreak'
                : 'shortBreak';
        } else {
            nextMode = 'focus';
        }

        setState({
            ...state,
            isRunning: false,
            mode: nextMode,
            timeRemaining: getTimerDuration(nextMode, state.settings),
            sessionsCompleted,
        });
    };

    const updateSettings = (newSettings: Partial<TimerSettings>) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            ...newSettings
        }));
    };

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <PomodoroContext.Provider
            value={{
                state,
                startTimer,
                pauseTimer,
                resetTimer,
                skipTimer,
                updateSettings
            }}
        >
            {children}
        </PomodoroContext.Provider>
    );
}

export function usePomodoro() {
    const context = useContext(PomodoroContext);
    if (context === undefined) {
        throw new Error('usePomodoro must be used within a PomodoroProvider');
    }
    return context;
}
