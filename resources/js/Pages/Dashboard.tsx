import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import ThemeSwitchExample from '@/Components/ThemeSwitchExample';
import { usePomodoro } from '@/Contexts/PomodoroContext';
import { Link } from '@inertiajs/react';

export default function Dashboard() {
    const { state } = usePomodoro();

    // Format time for display (mm:ss)
    const formatTime = (ms: number) => {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            You're logged in!
                        </div>
                    </div>

                    {/* Pomodoro Status Card */}
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                            <div className="p-6">
                                <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white">
                                    Pomodoro Status
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Current Mode: <span className="font-medium">{state.mode === 'focus' ? 'Focus' : state.mode === 'shortBreak' ? 'Short Break' : 'Long Break'}</span>
                                        </p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            Time Remaining: <span className="font-medium">{formatTime(state.timeRemaining)}</span>
                                        </p>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            Sessions Completed: <span className="font-medium">{state.sessionsCompleted}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <Link
                                            href={route('pomodoro')}
                                            className="inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-2 h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Open Pomodoro Timer
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Theme Switch Example */}
                        <ThemeSwitchExample />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
