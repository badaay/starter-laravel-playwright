import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PomodoroTimer from '@/Components/PomodoroTimer';
import { Head } from '@inertiajs/react';

export default function Pomodoro() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Pomodoro Timer
                </h2>
            }
        >
            <Head title="Pomodoro Timer" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <PomodoroTimer />

                    {/* Pomodoro information */}
                    <div className="mt-8 overflow-hidden rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white">
                            About the Pomodoro Technique
                        </h3>
                        <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 dark:prose-headings:text-gray-100 dark:prose-strong:text-gray-100 dark:prose-ol:text-gray-300 dark:prose-ul:text-gray-300">
                            <p>
                                The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s.
                            </p>
                            <p className="mt-2">
                                The technique uses a timer to break down work into intervals, traditionally 25 minutes in length, separated by short breaks. These intervals are known as "pomodoros".
                            </p>
                            <h4 className="mt-4 text-base font-medium text-gray-800 dark:text-gray-200">The Basic Process:</h4>
                            <ol className="text-gray-600 dark:text-gray-300">
                                <li>Decide on the task to be done</li>
                                <li>Set the timer for 25 minutes (a "pomodoro")</li>
                                <li>Work on the task until the timer rings</li>
                                <li>Take a short break (5 minutes)</li>
                                <li>Every 4 pomodoros, take a longer break (15-30 minutes)</li>
                            </ol>
                            <p className="mt-2">
                                This technique helps improve focus and reduce distractions by working in dedicated time blocks.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
