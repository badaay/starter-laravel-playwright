import React from 'react';

interface FocusData {
    name: string;
    taskCount: number;
    completedCount: number;
    focusTime: number;
    percentage: number;
}

interface Props {
    data: FocusData[];
}

const COLORS = [
    { bg: 'bg-blue-500', text: 'text-blue-500', dark: 'dark:bg-blue-600' },
    { bg: 'bg-green-500', text: 'text-green-500', dark: 'dark:bg-green-600' },
    { bg: 'bg-yellow-500', text: 'text-yellow-500', dark: 'dark:bg-yellow-600' },
    { bg: 'bg-purple-500', text: 'text-purple-500', dark: 'dark:bg-purple-600' },
    { bg: 'bg-pink-500', text: 'text-pink-500', dark: 'dark:bg-pink-600' },
    { bg: 'bg-indigo-500', text: 'text-indigo-500', dark: 'dark:bg-indigo-600' },
    { bg: 'bg-red-500', text: 'text-red-500', dark: 'dark:bg-red-600' },
    { bg: 'bg-cyan-500', text: 'text-cyan-500', dark: 'dark:bg-cyan-600' },
];

export default function FocusDistribution({ data }: Props) {
    // Sort data by percentage descending
    const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

    // Format minutes into hours and minutes
    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);

        if (hours === 0) return `${mins} min`;
        if (mins === 0) return `${hours} hr`;
        return `${hours} hr ${mins} min`;
    };

    return (
        <div className="mt-4">
            {sortedData.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">No focus data available yet.</p>
            ) : (
                <>
                    {/* Distribution chart */}
                    <div className="mb-6 h-8 w-full overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700">
                        <div className="flex h-full">
                            {sortedData.map((item, index) => (
                                <div
                                    key={index}
                                    className={`${COLORS[index % COLORS.length].bg} ${COLORS[index % COLORS.length].dark} h-full`}
                                    style={{ width: `${item.percentage}%` }}
                                    title={`${item.name}: ${item.percentage}%`}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Legend and details */}
                    <div className="mt-4 space-y-3">
                        {sortedData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700">
                                <div className="flex items-center">
                                    <div className={`mr-3 h-4 w-4 rounded-sm ${COLORS[index % COLORS.length].bg} ${COLORS[index % COLORS.length].dark}`}></div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.completedCount}/{item.taskCount} tasks · {formatTime(item.focusTime)}
                                        </div>
                                    </div>
                                </div>
                                <div className={`font-bold ${COLORS[index % COLORS.length].text}`}>
                                    {item.percentage}%
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
