import axios from 'axios';

interface PomodoroSessionData {
    type: 'focus' | 'shortBreak' | 'longBreak';
    duration: number;
    completed: boolean;
    todoId?: number;
    startedAt: Date;
    completedAt?: Date;
}

export function savePomodoroSession(sessionData: PomodoroSessionData) {
    return axios.post('/api/pomodoro/sessions', sessionData);
}

export function getTodaySessions() {
    return axios.get('/api/pomodoro/sessions/today');
}

export function getSessionStats(days: number = 7) {
    return axios.get(`/api/pomodoro/stats?days=${days}`);
}
