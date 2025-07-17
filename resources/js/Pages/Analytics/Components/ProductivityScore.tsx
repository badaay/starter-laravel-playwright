import React from 'react';

interface Props {
    score: number;
    trend: number;
}

export default function ProductivityScore({ score, trend }: Props) {
    const getScoreColor = () => {
        if (score >= 75) return 'text-green-500 dark:text-green-400';
        if (score >= 50) return 'text-blue-500 dark:text-blue-400';
        if (score >= 25) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-red-500 dark:text-red-400';
    };

    const getTrendIcon = () => {
        if (trend > 5) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            );
        }
        if (trend < -5) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
            );
        }
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
        );
    };

    const getScoreDescription = () => {
        if (score >= 75) return 'Excellent';
        if (score >= 50) return 'Good';
        if (score >= 25) return 'Average';
        return 'Needs improvement';
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex items-center">
                <div className="text-6xl font-bold leading-none tracking-tight">
                    <span className={getScoreColor()}>{score}</span>
                    <span className="text-gray-400 dark:text-gray-500">/100</span>
                </div>
                <div className="ml-4">
                    {getTrendIcon()}
                    <span className={trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                </div>
            </div>
            <div className="mt-4 text-xl text-gray-500 dark:text-gray-400">
                {getScoreDescription()}
            </div>
            <div className="mt-8 w-full">
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                        className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: `${score}%` }}
                    ></div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Needs improvement</span>
                    <span>Average</span>
                    <span>Good</span>
                    <span>Excellent</span>
                </div>
            </div>
        </div>
    );
}
