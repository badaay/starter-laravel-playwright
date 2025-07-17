import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProductivityScore from './Components/ProductivityScore';
import WeeklyOverview from './Components/WeeklyOverview';
import FocusDistribution from './Components/FocusDistribution';
import TimeframeSelector from './Components/TimeframeSelector';

interface Props {
    productivityScore: {
        score: number;
        trend: number;
        taskCompletionRate: number;
        focusSessionsCount: number;
        totalTasks: number;
        completedTasks: number;
    };
    weeklyOverview: Array<{
        dayName: string;
        completedTasks: number;
        pomodoroSessions: number;
        pomodoroMinutes: number;
    }>;
    focusDistribution: Array<{
        name: string;
        taskCount: number;
        completedCount: number;
        focusTime: number;
        percentage: number;
    }>;
}

export default function Dashboard({ productivityScore, weeklyOverview, focusDistribution }: Props) {
    const [timeframe, setTimeframe] = useState<'7d' | '14d' | '30d' | '90d'>('7d');

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Productivity Analytics</h2>}
        >
            <Head title="Productivity Analytics" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-end">
                        <TimeframeSelector timeframe={timeframe} onChange={setTimeframe} />
                    </div>

                    {/* Main Dashboard Content */}
                    <div className="space-y-6">
                        {/* Productivity Score */}
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <div className="p-6">
                                <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Productivity Score</h2>
                                <ProductivityScore score={productivityScore.score} trend={productivityScore.trend} />
                            </div>
                        </div>

                        {/* Weekly Overview */}
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <div className="p-6">
                                <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Weekly Overview</h2>
                                <WeeklyOverview data={weeklyOverview} />
                            </div>
                        </div>

                        {/* Focus Distribution */}
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <div className="p-6">
                                <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Focus Distribution</h2>
                                <FocusDistribution data={focusDistribution} />
                            </div>
                        </div>

                        {/* Productivity Tips */}
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <div className="p-6">
                                <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">Productivity Insights</h2>
                                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/30">
                                        <h3 className="mb-2 text-base font-medium text-blue-800 dark:text-blue-300">Task Completion</h3>
                                        <p>
                                            You've completed {productivityScore.completedTasks} out of {productivityScore.totalTasks} tasks
                                            ({productivityScore.taskCompletionRate}%). {productivityScore.taskCompletionRate > 70
                                                ? 'Great job keeping on top of your tasks!'
                                                : 'Consider breaking down larger tasks into smaller, more manageable ones.'}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-green-100 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/30">
                                        <h3 className="mb-2 text-base font-medium text-green-800 dark:text-green-300">Focus Time</h3>
                                        <p>
                                            You've completed {productivityScore.focusSessionsCount} focus sessions recently.{' '}
                                            {productivityScore.focusSessionsCount > 10
                                                ? 'Keep up the great focus work!'
                                                : 'Try to complete at least 4 focused sessions each day for optimal productivity.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
