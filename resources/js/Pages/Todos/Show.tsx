import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface Todo {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    todo: Todo;
}

export default function Show({ todo }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Todo Details
                </h2>
            }
        >
            <Head title={`Todo: ${todo.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-end space-x-4">
                        <Link
                            href={route('todos.index')}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
                        >
                            Back to List
                        </Link>
                        <Link
                            href={route('todos.edit', todo.id)}
                            className="inline-flex items-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-yellow-700 focus:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-yellow-800"
                        >
                            Edit
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Status
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 ${
                                            todo.completed
                                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                        }`}
                                    >
                                        {todo.completed ? 'Completed' : 'Pending'}
                                    </span>
                                </p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Title
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {todo.title}
                                </p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Description
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {todo.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Created
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(todo.created_at).toLocaleString()}
                                </p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Last Updated
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(todo.updated_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
