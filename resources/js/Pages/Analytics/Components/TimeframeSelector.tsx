import React from 'react';

interface Props {
    timeframe: '7d' | '14d' | '30d' | '90d';
    onChange: (timeframe: '7d' | '14d' | '30d' | '90d') => void;
}

export default function TimeframeSelector({ timeframe, onChange }: Props) {
    const timeframes = [
        { id: '7d', label: '7 Days' },
        { id: '14d', label: '14 Days' },
        { id: '30d', label: '30 Days' },
        { id: '90d', label: '90 Days' },
    ];

    return (
        <div className="inline-flex rounded-md shadow-sm">
            {timeframes.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    className={`
                        relative inline-flex items-center px-4 py-2 text-sm font-medium
                        ${option.id === timeframe
                            ? 'bg-blue-600 text-white dark:bg-blue-700'
                            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}
                        ${option.id === timeframes[0].id ? 'rounded-l-md' : ''}
                        ${option.id === timeframes[timeframes.length - 1].id ? 'rounded-r-md' : ''}
                        border border-gray-300 dark:border-gray-600
                        focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500
                    `}
                    onClick={() => onChange(option.id as '7d' | '14d' | '30d' | '90d')}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
