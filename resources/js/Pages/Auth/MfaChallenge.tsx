import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import ApplicationLogo from '@/Components/ApplicationLogo';

interface Props {
    usesRecoveryCode?: boolean;
    usesEmailCode?: boolean;
}

export default function MfaChallenge({ usesRecoveryCode = false, usesEmailCode = false }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('mfa.verify'));
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100 dark:bg-gray-900">
            <Head title="Two-Factor Authentication" />

            <div>
                <Link href="/">
                    <ApplicationLogo className="w-20 h-20 fill-current text-gray-500" />
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg">
                <h2 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
                    Two-Factor Authentication
                </h2>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {usesRecoveryCode
                            ? 'Please enter one of your recovery codes to continue.'
                            : usesEmailCode
                                ? 'Please enter the verification code sent to your email to continue.'
                                : 'Please enter the verification code from your authenticator app to continue.'}
                    </p>
                    {usesEmailCode && (
                        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            The code has been sent to your email address. It will expire after 10 minutes.
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div>
                        <InputLabel htmlFor="code" value={usesRecoveryCode ? "Recovery Code" : "Verification Code"} />
                        <TextInput
                            id="code"
                            type="text"
                            name="code"
                            value={data.code}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('code', e.target.value)}
                            required
                            autoFocus
                            placeholder={usesRecoveryCode ? "Enter recovery code" : "Enter 6-digit code"}
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="space-y-2">
                            {!usesRecoveryCode && !usesEmailCode && (
                                <>
                                    <Link
                                        href={route('mfa.recovery')}
                                        className="block underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                                    >
                                        Use a recovery code
                                    </Link>
                                    <Link
                                        href={route('mfa.email')}
                                        className="block underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                                    >
                                        Send code to my email
                                    </Link>
                                </>
                            )}

                            {usesRecoveryCode && (
                                <>
                                    <Link
                                        href={route('mfa.challenge')}
                                        className="block underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                                    >
                                        Use authenticator app
                                    </Link>
                                    <Link
                                        href={route('mfa.email')}
                                        className="block underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                                    >
                                        Send code to my email
                                    </Link>
                                </>
                            )}

                            {usesEmailCode && (
                                <>
                                    <Link
                                        href={route('mfa.challenge')}
                                        className="block underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                                    >
                                        Use authenticator app
                                    </Link>
                                    <Link
                                        href={route('mfa.recovery')}
                                        className="block underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                                    >
                                        Use a recovery code
                                    </Link>
                                    <Link
                                        href={route('mfa.email')}
                                        className="block underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                                    >
                                        Resend email code
                                    </Link>
                                </>
                            )}
                        </div>

                        <PrimaryButton className="ml-4" disabled={processing}>
                            Verify
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
