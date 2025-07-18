import { useState, useEffect, FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { User } from '@/types';

interface EmailVerificationStatus {
    has_pending: boolean;
    is_verified: boolean;
    expires_at: string | null;
    attempts: number;
    can_request_new: boolean;
}

interface Props {
    auth: {
        user: User;
    };
    status: EmailVerificationStatus;
    email: string;
    flash?: {
        message?: string;
        status?: string;
    };
}

export default function EmailVerification({ auth, status: initialStatus, email, flash }: Props) {
    const [status, setStatus] = useState<EmailVerificationStatus>(initialStatus);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        purpose: 'verification',
    });

    const sendForm = useForm({
        purpose: 'verification',
    });

    // Calculate time left for code expiration
    useEffect(() => {
        if (status.expires_at) {
            const expiryTime = new Date(status.expires_at).getTime();
            const now = new Date().getTime();
            const timeRemaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
            setTimeLeft(timeRemaining);

            if (timeRemaining > 0) {
                const timer = setInterval(() => {
                    setTimeLeft((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            // Refresh status when expired
                            fetchStatus();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                return () => clearInterval(timer);
            }
        }
    }, [status.expires_at]);

    const fetchStatus = async () => {
        try {
            const response = await fetch('/email-verification/status?purpose=verification', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            const data = await response.json();
            setStatus(data.status);
        } catch (error) {
            console.error('Failed to fetch status:', error);
        }
    };

    const sendCode: FormEventHandler = (e) => {
        e.preventDefault();
        sendForm.post('/email-verification/send', {
            onSuccess: () => {
                fetchStatus();
            },
        });
    };

    const verifyCode: FormEventHandler = (e) => {
        e.preventDefault();
        post('/email-verification/verify', {
            onSuccess: () => {
                reset('code');
                fetchStatus();
            },
        });
    };

    const resendCode: FormEventHandler = (e) => {
        e.preventDefault();
        sendForm.post('/email-verification/resend', {
            onSuccess: () => {
                fetchStatus();
            },
        });
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Email Verification</h2>}
        >
            <Head title="Email Verification" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    Email Verification
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    We'll send a 6-digit verification code to your email address to confirm your identity.
                                </p>
                                <div className="mt-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        📧 {email}
                                    </span>
                                </div>
                            </div>

                            {/* Flash Messages */}
                            {flash?.message && (
                                <div className={`mb-6 p-4 rounded-lg ${
                                    flash.status === 'verification-code-sent' || flash.status === 'verification-code-resent'
                                        ? 'bg-green-100 border border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
                                        : flash.status === 'email-verified'
                                        ? 'bg-blue-100 border border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
                                        : 'bg-yellow-100 border border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200'
                                }`}>
                                    <div className="flex items-center">
                                        <span className="mr-2">
                                            {flash.status?.includes('sent') ? '✅' : 
                                             flash.status === 'email-verified' ? '🎉' : 'ℹ️'}
                                        </span>
                                        {flash.message}
                                    </div>
                                </div>
                            )}

                            {/* Current Status */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Status</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Pending Code:</span>
                                        <span className={`ml-2 font-medium ${status.has_pending ? 'text-green-600' : 'text-gray-500'}`}>
                                            {status.has_pending ? '✅ Yes' : '❌ No'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Verified:</span>
                                        <span className={`ml-2 font-medium ${status.is_verified ? 'text-green-600' : 'text-gray-500'}`}>
                                            {status.is_verified ? '✅ Yes' : '❌ No'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Attempts:</span>
                                        <span className={`ml-2 font-medium ${status.attempts >= 3 ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {status.attempts}/3
                                        </span>
                                    </div>
                                    {timeLeft > 0 && (
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Expires in:</span>
                                            <span className="ml-2 font-medium text-orange-600">
                                                {formatTime(timeLeft)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Send Code Section */}
                            {!status.has_pending && status.can_request_new && (
                                <div className="mb-6">
                                    <form onSubmit={sendCode}>
                                        <div className="text-center">
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                Click the button below to send a verification code to your email.
                                            </p>
                                            <PrimaryButton 
                                                disabled={sendForm.processing}
                                                className="px-8"
                                            >
                                                {sendForm.processing ? 'Sending...' : 'Send Verification Code'}
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Verify Code Section */}
                            {status.has_pending && (
                                <div className="mb-6">
                                    <form onSubmit={verifyCode} className="space-y-4">
                                        <div>
                                            <InputLabel htmlFor="code" value="Enter 6-digit verification code" />
                                            <TextInput
                                                id="code"
                                                type="text"
                                                name="code"
                                                value={data.code}
                                                className="mt-1 block w-full text-center text-2xl tracking-widest"
                                                maxLength={6}
                                                placeholder="000000"
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    setData('code', value);
                                                }}
                                            />
                                            <InputError message={errors.code} className="mt-2" />
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <PrimaryButton 
                                                disabled={processing || data.code.length !== 6}
                                                className="flex-1"
                                            >
                                                {processing ? 'Verifying...' : 'Verify Code'}
                                            </PrimaryButton>
                                            
                                            <SecondaryButton 
                                                type="button"
                                                onClick={resendCode}
                                                disabled={sendForm.processing || !status.can_request_new}
                                                className="flex-1"
                                            >
                                                {sendForm.processing ? 'Sending...' : 'Resend Code'}
                                            </SecondaryButton>
                                        </div>
                                    </form>

                                    {timeLeft > 0 && (
                                        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                            Code expires in {formatTime(timeLeft)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Already Verified */}
                            {status.is_verified && (
                                <div className="text-center p-6 bg-green-50 dark:bg-green-900 rounded-lg">
                                    <div className="text-green-600 dark:text-green-400 text-4xl mb-2">✅</div>
                                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                                        Email Verified Successfully!
                                    </h3>
                                    <p className="text-green-700 dark:text-green-300">
                                        Your email address has been verified and you can continue using the application.
                                    </p>
                                </div>
                            )}

                            {/* Rate Limited */}
                            {!status.can_request_new && !status.has_pending && (
                                <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                                    <div className="text-yellow-600 dark:text-yellow-400 text-4xl mb-2">⏳</div>
                                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                        Please Wait
                                    </h3>
                                    <p className="text-yellow-700 dark:text-yellow-300">
                                        Please wait at least 1 minute before requesting a new verification code.
                                    </p>
                                </div>
                            )}

                            {/* Help Section */}
                            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                    📋 How it works:
                                </h4>
                                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                    <li>• Click "Send Verification Code" to receive a 6-digit code via email</li>
                                    <li>• Enter the code in the field above within 10 minutes</li>
                                    <li>• You have 3 attempts to enter the correct code</li>
                                    <li>• Request a new code if your current one expires</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
