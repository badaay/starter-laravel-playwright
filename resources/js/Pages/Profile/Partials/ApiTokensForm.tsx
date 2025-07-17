import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';

export default function ApiTokensForm({ className = '', tokens = [] }: { className?: string; tokens?: any[] }) {
    const [tokenName, setTokenName] = useState('');
    const [creatingToken, setCreatingToken] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [displayingToken, setDisplayingToken] = useState(false);
    const [apiTokens, setApiTokens] = useState<any[]>(tokens);
    const [managingPermissions, setManagingPermissions] = useState<boolean>(false);
    const [currentToken, setCurrentToken] = useState<any>(null);
    const [confirmingTokenDeletion, setConfirmingTokenDeletion] = useState(false);
    const [tokenBeingDeleted, setTokenBeingDeleted] = useState<any>(null);
    const [plainTextToken, setPlainTextToken] = useState<string>('');

    const createApiTokenForm = useForm({
        name: '',
        permissions: [] as string[],
    });

    const updateApiTokenForm = useForm({
        permissions: [] as string[],
    });

    const deleteApiTokenForm = useForm({});

    const createToken = () => {
        createApiTokenForm.post(route('api-tokens.store'), {
            preserveScroll: true,
            onSuccess: (response) => {
                setPlainTextToken(response.props.plainTextToken);
                setApiTokens([response.props.token, ...apiTokens]);

                setCreatingToken(false);
                setDisplayingToken(true);
                createApiTokenForm.reset();
            },
        });
    };

    const updateTokenPermissions = () => {
        if (!currentToken) return;

        updateApiTokenForm.put(route('api-tokens.update', [currentToken.id]), {
            preserveScroll: true,
            onSuccess: (response) => {
                setManagingPermissions(false);

                // Update token in the list
                const updatedTokens = apiTokens.map(token => {
                    if (token.id === currentToken.id) {
                        return response.props.token;
                    }
                    return token;
                });

                setApiTokens(updatedTokens);
            },
        });
    };

    const confirmTokenDeletion = (token: any) => {
        setTokenBeingDeleted(token);
        setConfirmingTokenDeletion(true);
    };

    const deleteToken = () => {
        if (!tokenBeingDeleted) return;

        deleteApiTokenForm.delete(route('api-tokens.destroy', [tokenBeingDeleted.id]), {
            preserveScroll: true,
            onSuccess: () => {
                // Remove token from the list
                const updatedTokens = apiTokens.filter(token => token.id !== tokenBeingDeleted.id);
                setApiTokens(updatedTokens);

                setConfirmingTokenDeletion(false);
            },
        });
    };

    const permissions = [
        'create',
        'read',
        'update',
        'delete',
    ];

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    API Tokens
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Create API tokens to interact with the application programmatically.
                </p>
            </header>

            {/* Token List */}
            <div className="mt-6 space-y-6">
                {apiTokens.length === 0 ? (
                    <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                        You haven't created any API tokens yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Created</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {apiTokens.map((token) => (
                                    <tr key={token.id} className="border-b dark:border-gray-700">
                                        <td className="px-6 py-4">{token.name}</td>
                                        <td className="px-6 py-4">{new Date(token.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => {
                                                    setCurrentToken(token);
                                                    updateApiTokenForm.setData('permissions', token.abilities);
                                                    setManagingPermissions(true);
                                                }}
                                                className="text-blue-600 hover:underline mr-4 dark:text-blue-400"
                                            >
                                                Permissions
                                            </button>

                                            <button
                                                onClick={() => confirmTokenDeletion(token)}
                                                className="text-red-600 hover:underline dark:text-red-400"
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

                <div>
                    <PrimaryButton onClick={() => setCreatingToken(true)}>
                        Create Token
                    </PrimaryButton>
                </div>
            </div>

            {/* Create Token Modal */}
            <Modal show={creatingToken} onClose={() => setCreatingToken(false)}>
                <form onSubmit={(e) => { e.preventDefault(); createToken(); }} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Create API Token
                    </h2>

                    <div className="mt-6">
                        <InputLabel htmlFor="token-name" value="Name" />
                        <TextInput
                            id="token-name"
                            type="text"
                            value={createApiTokenForm.data.name}
                            onChange={(e) => createApiTokenForm.setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            autoComplete="off"
                        />
                        <InputError message={createApiTokenForm.errors.name} className="mt-2" />
                    </div>

                    {/* Permissions */}
                    <div className="mt-6">
                        <InputLabel value="Permissions" />

                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {permissions.map((permission) => (
                                <div key={permission} className="flex items-start">
                                    <div className="flex h-5 items-center">
                                        <input
                                            id={`create-permission-${permission}`}
                                            name={`permissions[${permission}]`}
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-offset-gray-800"
                                            value={permission}
                                            checked={createApiTokenForm.data.permissions.includes(permission)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    createApiTokenForm.setData('permissions', [
                                                        ...createApiTokenForm.data.permissions,
                                                        permission,
                                                    ]);
                                                } else {
                                                    createApiTokenForm.setData('permissions',
                                                        createApiTokenForm.data.permissions.filter(p => p !== permission)
                                                    );
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label
                                            htmlFor={`create-permission-${permission}`}
                                            className="font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            {permission.charAt(0).toUpperCase() + permission.slice(1)}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setCreatingToken(false)}>
                            Cancel
                        </SecondaryButton>

                        <PrimaryButton
                            className="ml-3"
                            disabled={createApiTokenForm.processing}
                        >
                            Create
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Display Token Modal */}
            <Modal show={displayingToken} onClose={() => setDisplayingToken(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        API Token Created
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Please copy your new API token. For your security, it won't be shown again.
                    </p>

                    <div className="mt-4">
                        <textarea
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 p-2 text-sm font-mono text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                            rows={3}
                            readOnly
                            value={plainTextToken}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>

                    <div className="mt-4 flex justify-end">
                        <SecondaryButton onClick={() => setDisplayingToken(false)}>
                            Close
                        </SecondaryButton>
                    </div>
                </div>
            </Modal>

            {/* Manage Permissions Modal */}
            <Modal show={managingPermissions} onClose={() => setManagingPermissions(false)}>
                {currentToken && (
                    <form onSubmit={(e) => { e.preventDefault(); updateTokenPermissions(); }} className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {currentToken.name} Permissions
                        </h2>

                        <div className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {permissions.map((permission) => (
                                    <div key={permission} className="flex items-start">
                                        <div className="flex h-5 items-center">
                                            <input
                                                id={`update-permission-${permission}`}
                                                name={`permissions[${permission}]`}
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-offset-gray-800"
                                                value={permission}
                                                checked={updateApiTokenForm.data.permissions.includes(permission)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        updateApiTokenForm.setData('permissions', [
                                                            ...updateApiTokenForm.data.permissions,
                                                            permission,
                                                        ]);
                                                    } else {
                                                        updateApiTokenForm.setData('permissions',
                                                            updateApiTokenForm.data.permissions.filter(p => p !== permission)
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label
                                                htmlFor={`update-permission-${permission}`}
                                                className="font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                {permission.charAt(0).toUpperCase() + permission.slice(1)}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={() => setManagingPermissions(false)}>
                                Cancel
                            </SecondaryButton>

                            <PrimaryButton
                                className="ml-3"
                                disabled={updateApiTokenForm.processing}
                            >
                                Save
                            </PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Delete Token Confirmation Modal */}
            <Modal show={confirmingTokenDeletion} onClose={() => setConfirmingTokenDeletion(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Delete API Token
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this API token? Once deleted, all applications using this token will no longer be able to access the API.
                    </p>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setConfirmingTokenDeletion(false)}>
                            Cancel
                        </SecondaryButton>

                        <button
                            type="button"
                            className="ml-3 inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700 dark:focus:ring-offset-gray-800"
                            onClick={deleteToken}
                            disabled={deleteApiTokenForm.processing}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </section>
    );
}
