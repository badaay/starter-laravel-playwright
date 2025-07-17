import { usePomodoro } from '@/Contexts/PomodoroContext';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function PomodoroWidget() {
    const { state, startTimer, pauseTimer } = usePomodoro();
    const [mounted, setMounted] = useState(false);

    // Format time for display (mm:ss)
    const formatTime = (ms: number) => {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Get color based on mode
    const getModeColor = (mode: 'focus' | 'shortBreak' | 'longBreak'): string => {
        switch (mode) {
            case 'focus':
                return 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700';
            case 'shortBreak':
                return 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700';
            case 'longBreak':
                return 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700';
        }
    };

    // Get icon based on mode
    const getModeIcon = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
        switch (mode) {
            case 'focus':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'shortBreak':
            case 'longBreak':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    </svg>
                );
        }
    };

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end space-y-2">
            <div className={`flex items-center justify-between rounded-full px-4 py-2 text-white shadow-lg ${getModeColor(state.mode)}`}>
                <div className="mr-2">
                    {getModeIcon(state.mode)}
                </div>
                <div className="text-lg font-semibold">
                    {formatTime(state.timeRemaining)}
                </div>
                <div className="ml-4 flex space-x-2">
                    {state.isRunning ? (
                        <button
                            onClick={pauseTimer}
                            className="rounded-full p-1 hover:bg-white/10"
                            title="Pause Timer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={startTimer}
                            className="rounded-full p-1 hover:bg-white/10"
                            title="Start Timer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                        </button>
                    )}
                    <Link
                        href={route('pomodoro')}
                        className="rounded-full p-1 hover:bg-white/10"
                        title="Open Pomodoro Timer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
