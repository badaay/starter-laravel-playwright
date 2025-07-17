import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function MfaForm({ className = '', user, mfaEnabled = false, recoveryCodes = [] }: { className?: string, user: any, mfaEnabled?: boolean, recoveryCodes?: string[] }) {
    const [showingRecoveryCodes, setShowingRecoveryCodes] = useState(false);
    const [confirmingMfaDisable, setConfirmingMfaDisable] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const disableMfa: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('mfa.disable'), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmingMfaDisable(false);
                reset();
            }
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Two Factor Authentication</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Add additional security to your account using two factor authentication.
                </p>
            </header>

            <div className="mt-3 max-w-xl">
                {!mfaEnabled ? (
                    <div>
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                When two-factor authentication is enabled, you will be prompted for a secure, random token during authentication.
                                You may retrieve this token from your phone's Google Authenticator application.
                            </p>
                        </div>

                        <div className="mt-4">
                            <Link
                                href={route('mfa.setup')}
                                className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white dark:focus:bg-white dark:focus:ring-offset-gray-800 dark:active:bg-gray-300"
                            >
                                Setup Two Factor Authentication
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">Two factor authentication is now enabled.</p>
                            <p className="mt-2">
                                When two-factor authentication is enabled, you will be prompted for a secure, random token during authentication.
                                You may retrieve this token from your phone's Google Authenticator application.
                            </p>
                        </div>

                        {recoveryCodes.length > 0 && (
                            <div className="mt-4">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">Store these recovery codes in a secure password manager.</p>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    They can be used to recover access to your account if your two factor authentication device is lost.
                                </p>

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        className="text-sm text-gray-600 underline dark:text-gray-400"
                                        onClick={() => setShowingRecoveryCodes(!showingRecoveryCodes)}
                                    >
                                        {showingRecoveryCodes ? 'Hide Recovery Codes' : 'Show Recovery Codes'}
                                    </button>
                                </div>

                                {showingRecoveryCodes && (
                                    <div className="mt-4 rounded bg-gray-100 p-4 font-mono text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                        {recoveryCodes.map((code, index) => (
                                            <div key={index}>{code}</div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            post(route('mfa.recovery.regenerate'));
                                        }}
                                    >
                                        <SecondaryButton type="submit">
                                            Regenerate Recovery Codes
                                        </SecondaryButton>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="mt-4">
                            {!confirmingMfaDisable ? (
                                <div>
                                    <SecondaryButton
                                        onClick={() => setConfirmingMfaDisable(true)}
                                    >
                                        Disable Two Factor Authentication
                                    </SecondaryButton>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                                        Please enter your password to confirm you would like to disable two factor authentication.
                                    </p>

                                    <form onSubmit={disableMfa}>
                                        <div className="mt-4">
                                            <InputLabel htmlFor="password" value="Password" />
                                            <TextInput
                                                id="password"
                                                type="password"
                                                name="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="mt-1 block w-full"
                                                required
                                                autoFocus
                                            />
                                            <InputError message={errors.password} className="mt-2" />
                                        </div>

                                        <div className="mt-4 flex">
                                            <PrimaryButton className="mr-3" disabled={processing}>Disable</PrimaryButton>
                                            <SecondaryButton
                                                type="button"
                                                onClick={() => {
                                                    setConfirmingMfaDisable(false);
                                                    reset();
                                                }}
                                            >
                                                Cancel
                                            </SecondaryButton>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
