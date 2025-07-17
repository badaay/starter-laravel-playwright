import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';

interface Props {
    // No additional props needed - user email is available through auth context
}

export default function MfaEmailSetup({}: Props) {
    const [emailSent, setEmailSent] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const sendTestCode = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('mfa.email.send'), {
            onSuccess: () => {
                setEmailSent(true);
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('mfa.email.enable'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Set Up Email Two-Factor Authentication</h2>}
        >
            <Head title="Set Up Email Two-Factor Authentication" />

            <div className="py-4 flex flex-col h-[calc(100vh-10rem)]">
                <div className="mx-auto max-w-2xl w-full flex-1 flex flex-col sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800 flex-1 flex flex-col">
                        <div className="p-4 md:p-8 text-gray-900 dark:text-gray-100 flex-1 flex flex-col">
                            <div className="flex-1 flex flex-col">
                                <h3 className="mb-3 text-2xl font-medium text-center">Email Verification Setup</h3>
                                <p className="mb-8 text-center text-sm text-gray-600 dark:text-gray-400">
                                    Set up email-based two-factor authentication. You'll receive verification codes 
                                    via email when logging in.
                                </p>

                                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                                    {!emailSent ? (
                                        <div className="text-center">
                                            <div className="mb-6">
                                                <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.05a1 1 0 00.98 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <p className="mb-6 text-gray-600 dark:text-gray-400">
                                                We'll send a test verification code to your email address to ensure 
                                                email delivery is working properly.
                                            </p>
                                            <form onSubmit={sendTestCode}>
                                                <PrimaryButton className="w-full justify-center py-3 text-lg" disabled={processing}>
                                                    Send Test Code
                                                </PrimaryButton>
                                            </form>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-center mb-6">
                                                <svg className="mx-auto h-16 w-16 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
                                                A verification code has been sent to your email. 
                                                Please enter it below to complete the setup.
                                            </p>

                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div>
                                                    <InputLabel htmlFor="code" value="Verification Code" />
                                                    <TextInput
                                                        id="code"
                                                        type="text"
                                                        name="code"
                                                        value={data.code}
                                                        className="mt-1 block w-full text-center text-lg"
                                                        onChange={(e) => setData('code', e.target.value)}
                                                        required
                                                        autoFocus
                                                        placeholder="Enter 6-digit code"
                                                        maxLength={6}
                                                    />
                                                    <InputError message={errors.code} className="mt-2" />
                                                </div>

                                                <div className="flex flex-col space-y-3">
                                                    <PrimaryButton className="w-full justify-center py-3 text-lg" disabled={processing}>
                                                        Enable Email Verification
                                                    </PrimaryButton>
                                                    
                                                    <SecondaryButton
                                                        type="button"
                                                        className="w-full justify-center"
                                                        onClick={() => {
                                                            setEmailSent(false);
                                                            setData('code', '');
                                                        }}
                                                    >
                                                        Send Another Code
                                                    </SecondaryButton>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    <div className="mt-8 text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Email codes expire after 10 minutes and can only be used once.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
