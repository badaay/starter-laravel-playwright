import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import ThemeSwitchExample from '@/Components/ThemeSwitchExample';
import EmailVerificationBanner from '@/Components/EmailVerificationBanner';

interface Todo {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

interface DashboardPageProps extends PageProps {
    todos: Todo[];
    todosCount: number;
    completedTodosCount: number;
    pendingTodosCount: number;
    mfaEnabled: boolean;
}

export default function Dashboard() {
    const { auth, todos = [], todosCount = 0, completedTodosCount = 0, pendingTodosCount = 0, mfaEnabled = false } = usePage<DashboardPageProps>().props;

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
                    {/* Email Verification Banner */}
                    <EmailVerificationBanner 
                        user={auth.user} 
                        className="mb-6"
                        variant="warning"
                    />
                    
                    {/* Welcome Section */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800 mb-6">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-semibold mb-2">
                                Welcome back, {auth.user.name}!
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Here's an overview of your todos and account security.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Total Todos */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {todosCount}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Todos</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Completed Todos */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {completedTodosCount}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pending Todos */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                                        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {pendingTodosCount}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Todos */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Recent Todos
                                    </h3>
                                    <Link
                                        href={route('todos.index')}
                                        className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        View all →
                                    </Link>
                                </div>
                                
                                {todos.length > 0 ? (
                                    <div className="space-y-3">
                                        {todos.slice(0, 3).map((todo) => (
                                            <div
                                                key={todo.id}
                                                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                            >
                                                <div className={`w-3 h-3 rounded-full mr-3 ${
                                                    todo.completed ? 'bg-green-500' : 'bg-yellow-500'
                                                }`}></div>
                                                <div className="flex-1">
                                                    <h4 className={`font-medium ${
                                                        todo.completed 
                                                            ? 'line-through text-gray-500 dark:text-gray-400' 
                                                            : 'text-gray-900 dark:text-gray-100'
                                                    }`}>
                                                        {todo.title}
                                                    </h4>
                                                    {todo.description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                            {todo.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No todos</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Get started by creating your first todo.
                                        </p>
                                        <div className="mt-6">
                                            <Link
                                                href={route('todos.create')}
                                                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            >
                                                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Create Todo
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Status */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Account Security
                                    </h3>
                                    <Link
                                        href={route('profile.edit')}
                                        className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        Manage →
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {/* MFA Status */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-full ${
                                                mfaEnabled 
                                                    ? 'bg-green-100 dark:bg-green-900' 
                                                    : 'bg-red-100 dark:bg-red-900'
                                            }`}>
                                                <svg className={`w-5 h-5 ${
                                                    mfaEnabled 
                                                        ? 'text-green-600 dark:text-green-300' 
                                                        : 'text-red-600 dark:text-red-300'
                                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Two-Factor Authentication
                                                </p>
                                                <p className={`text-sm ${
                                                    mfaEnabled 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {mfaEnabled ? 'Enabled' : 'Disabled'}
                                                </p>
                                            </div>
                                        </div>
                                        {!mfaEnabled && (
                                            <Link
                                                href={route('profile.edit')}
                                                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                                            >
                                                Setup
                                            </Link>
                                        )}
                                    </div>

                                    {/* Email Verification Status */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-full ${
                                                auth.user.email_verified_at 
                                                    ? 'bg-green-100 dark:bg-green-900' 
                                                    : 'bg-yellow-100 dark:bg-yellow-900'
                                            }`}>
                                                <svg className={`w-5 h-5 ${
                                                    auth.user.email_verified_at 
                                                        ? 'text-green-600 dark:text-green-300' 
                                                        : 'text-yellow-600 dark:text-yellow-300'
                                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    Email Verification
                                                </p>
                                                <p className={`text-sm ${
                                                    auth.user.email_verified_at 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-yellow-600 dark:text-yellow-400'
                                                }`}>
                                                    {auth.user.email_verified_at ? 'Verified' : 'Pending'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Quick Actions
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href={route('todos.create')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    New Todo
                                </Link>
                                <Link
                                    href={route('todos.index')}
                                    className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    View All Todos
                                </Link>
                                <Link
                                    href={route('profile.edit')}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Security Settings
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Theme Switch Example */}
                    <div className="mt-6">
                        <ThemeSwitchExample />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
