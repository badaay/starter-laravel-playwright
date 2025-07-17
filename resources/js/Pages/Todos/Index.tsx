import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';

interface Todo {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    todos: Todo[];
}

export default function Index({ todos }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this todo?')) {
            router.delete(route('todos.destroy', id));
        }
    };

    const toggleCompleted = (todo: Todo) => {
        router.put(route('todos.update', todo.id), {
            ...todo,
            completed: !todo.completed
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Todos
                </h2>
            }
        >
            <Head title="Todos" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex justify-end">
                        <Link
                            href={route('todos.create')}
                            className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white dark:focus:bg-white dark:focus:ring-offset-gray-800 dark:active:bg-gray-300"
                        >
                            Create Todo
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {todos.length === 0 ? (
                                <p>No todos yet. Create one to get started!</p>
                            ) : (
                                <div className="mt-4">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                    Title
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                    Created
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                            {todos.map((todo) => (
                                                <tr key={todo.id}>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <button
                                                            onClick={() => toggleCompleted(todo)}
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 ${
                                                                todo.completed
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                                                            }`}
                                                        >
                                                            {todo.completed ? 'Completed' : 'Pending'}
                                                        </button>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {todo.title}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(todo.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                        <Link
                                                            href={route('todos.show', todo.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                        >
                                                            View
                                                        </Link>
                                                        <span className="mx-2">|</span>
                                                        <Link
                                                            href={route('todos.edit', todo.id)}
                                                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <span className="mx-2">|</span>
                                                        <button
                                                            onClick={() => handleDelete(todo.id)}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
