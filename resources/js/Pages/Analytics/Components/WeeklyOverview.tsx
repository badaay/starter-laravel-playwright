import React from 'react';

interface WeeklyData {
    dayName: string;
    completedTasks: number;
    pomodoroSessions: number;
    pomodoroMinutes: number;
}

interface Props {
    data: WeeklyData[];
}

export default function WeeklyOverview({ data }: Props) {
    // Calculate max values for scaling
    const maxTasks = Math.max(...data.map(d => d.completedTasks), 1);
    const maxSessions = Math.max(...data.map(d => d.pomodoroSessions), 1);

    return (
        <div className="mt-4">
            <div className="grid grid-cols-7 gap-2 md:gap-4">
                {data.map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {day.dayName}
                        </div>

                        {/* Tasks bar */}
                        <div className="mt-2 flex h-32 w-full flex-col items-center justify-end">
                            <div className="relative h-full w-full">
                                <div
                                    className="absolute bottom-0 left-0 right-0 w-full bg-blue-500 dark:bg-blue-600"
                                    style={{
                                        height: `${(day.completedTasks / maxTasks) * 100}%`,
                                        minHeight: day.completedTasks > 0 ? '10%' : '0%'
                                    }}
                                ></div>
                                <div
                                    className="absolute bottom-0 left-0 right-0 w-full bg-green-500 opacity-70 dark:bg-green-600"
                                    style={{
                                        height: `${(day.pomodoroSessions / maxSessions) * 100}%`,
                                        minHeight: day.pomodoroSessions > 0 ? '10%' : '0%',
                                        width: '65%',
                                        marginLeft: '17.5%'
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Values */}
                        <div className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                            {day.completedTasks > 0 && (
                                <div>{day.completedTasks} {day.completedTasks === 1 ? 'task' : 'tasks'}</div>
                            )}
                            {day.pomodoroSessions > 0 && (
                                <div>{day.pomodoroSessions} {day.pomodoroSessions === 1 ? 'session' : 'sessions'}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex justify-center">
                <div className="mr-6 flex items-center">
                    <div className="mr-2 h-3 w-3 bg-blue-500 dark:bg-blue-600"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">Completed Tasks</span>
                </div>
                <div className="flex items-center">
                    <div className="mr-2 h-3 w-3 bg-green-500 opacity-70 dark:bg-green-600"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">Focus Sessions</span>
                </div>
            </div>
        </div>
    );
}
