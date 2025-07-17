import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { FormEventHandler } from 'react';

interface Todo {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
}

interface Props {
    todo: Todo;
}

export default function Edit({ todo }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: todo.title || '',
        description: todo.description || '',
        completed: todo.completed || false
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('todos.update', todo.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Edit Todo
                </h2>
            }
        >
            <Head title="Edit Todo" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={submit}>
                                <div className="mt-4">
                                    <InputLabel htmlFor="title" value="Title" />
                                    <TextInput
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={data.title}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div className="mt-4 flex items-center">
                                    <input
                                        type="checkbox"
                                        id="completed"
                                        name="completed"
                                        checked={data.completed}
                                        onChange={(e) => setData('completed', e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
                                    />
                                    <label htmlFor="completed" className="ms-2 text-sm text-gray-700 dark:text-gray-300">
                                        Completed
                                    </label>
                                </div>

                                <div className="mt-6 flex items-center justify-end">
                                    <Link
                                        href={route('todos.index')}
                                        className="rounded-md text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        Cancel
                                    </Link>

                                    <PrimaryButton className="ms-4" disabled={processing}>
                                        Update
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
