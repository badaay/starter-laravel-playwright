import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function MfaForm({ 
    className = '', 
    user, 
    mfaEnabled = false, 
    totpEnabled = false, 
    emailMfaEnabled = false, 
    recoveryCodes = [] 
}: { 
    className?: string, 
    user: any, 
    mfaEnabled?: boolean, 
    totpEnabled?: boolean, 
    emailMfaEnabled?: boolean, 
    recoveryCodes?: string[] 
}) {
    const [showingRecoveryCodes, setShowingRecoveryCodes] = useState(false);
    const [confirmingTotpDisable, setConfirmingTotpDisable] = useState(false);
    const [confirmingEmailDisable, setConfirmingEmailDisable] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(!!user.email_verified_at);

    // Check email verification status dynamically
    useEffect(() => {
        const checkEmailVerification = async () => {
            try {
                const response = await fetch('/email-verification/status?purpose=verification', {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                });
                const data = await response.json();
                if (data.status?.is_verified) {
                    setIsEmailVerified(true);
                }
            } catch (error) {
                console.error('Failed to check email verification status:', error);
            }
        };

        // Check immediately
        checkEmailVerification();
        
        // Update when user prop changes
        setIsEmailVerified(!!user.email_verified_at);
    }, [user.email_verified_at]);

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const disableTotp: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('mfa.totp.disable'), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmingTotpDisable(false);
                reset();
            }
        });
    };

    const disableEmailMfa: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('mfa.email.disable'), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmingEmailDisable(false);
                reset();
            }
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Two Factor Authentication</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Add additional security to your account using two factor authentication. You can use both app-based (TOTP) and email-based verification methods.
                </p>
            </header>

            <div className="mt-6 space-y-6">
                {/* TOTP Section */}
                <div className="border rounded-lg p-4 dark:border-gray-700">
                    <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Authenticator App (TOTP)
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to generate time-based codes.
                    </p>
                    
                    {!totpEnabled ? (
                        <div>
                            <Link
                                href={route('mfa.setup')}
                                className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white dark:focus:bg-white dark:focus:ring-offset-gray-800 dark:active:bg-gray-300"
                            >
                                Setup Authenticator App
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center mb-3">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">Authenticator app is enabled</span>
                            </div>
                            
                            {!confirmingTotpDisable ? (
                                <SecondaryButton
                                    onClick={() => setConfirmingTotpDisable(true)}
                                >
                                    Disable Authenticator App
                                </SecondaryButton>
                            ) : (
                                <div className="mt-3">
                                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                                        Please enter your password to confirm you would like to disable authenticator app authentication.
                                    </p>
                                    <form onSubmit={disableTotp} className="space-y-3">
                                        <div>
                                            <InputLabel htmlFor="totp_password" value="Password" />
                                            <TextInput
                                                id="totp_password"
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
                                        <div className="flex space-x-3">
                                            <PrimaryButton disabled={processing}>Disable</PrimaryButton>
                                            <SecondaryButton
                                                type="button"
                                                onClick={() => {
                                                    setConfirmingTotpDisable(false);
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
                    )}
                </div>

                {/* Email MFA Section */}
                <div className="border rounded-lg p-4 dark:border-gray-700">
                    <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Email Verification
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Receive verification codes via email. Codes are valid for 10 minutes. 
                        {!isEmailVerified && (
                            <span className="text-amber-600 dark:text-amber-400 font-medium"> Note: Your email must be verified first.</span>
                        )}
                    </p>
                    
                    {/* Email Verification Status */}
                    {!isEmailVerified && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                        Email Verification Required
                                    </h4>
                                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                        You must verify your email address <strong>{user.email}</strong> before enabling email-based two-factor authentication.
                                    </p>
                                    <div className="mt-3">
                                        <Link
                                            href="/email-verification"
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-amber-800 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:text-amber-200 dark:bg-amber-800 dark:hover:bg-amber-700"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            Verify Email First
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {!emailMfaEnabled ? (
                        <div>
                            {isEmailVerified ? (
                                <div className="space-y-3">
                                    <div className="flex items-center p-2 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-green-700 dark:text-green-300">Email verified: <strong>{user.email}</strong></span>
                                    </div>
                                    <Link
                                        href={route('mfa.email.setup')}
                                        className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white dark:focus:bg-white dark:focus:ring-offset-gray-800 dark:active:bg-gray-300"
                                    >
                                        Setup Email Verification
                                    </Link>
                                </div>
                            ) : (
                                <div className="opacity-50">
                                    <button
                                        disabled
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-400 cursor-not-allowed"
                                    >
                                        Setup Email Verification
                                    </button>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Email verification required before enabling this feature.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center mb-3">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">Email verification is enabled</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                Verification codes will be sent to: <strong>{user.email}</strong>
                            </p>
                            
                            {!confirmingEmailDisable ? (
                                <SecondaryButton
                                    onClick={() => setConfirmingEmailDisable(true)}
                                >
                                    Disable Email Verification
                                </SecondaryButton>
                            ) : (
                                <div className="mt-3">
                                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                                        Please enter your password to confirm you would like to disable email verification.
                                    </p>
                                    <form onSubmit={disableEmailMfa} className="space-y-3">
                                        <div>
                                            <InputLabel htmlFor="email_password" value="Password" />
                                            <TextInput
                                                id="email_password"
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
                                        <div className="flex space-x-3">
                                            <PrimaryButton disabled={processing}>Disable</PrimaryButton>
                                            <SecondaryButton
                                                type="button"
                                                onClick={() => {
                                                    setConfirmingEmailDisable(false);
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
                    )}
                </div>

                {/* Recovery Codes Section */}
                {(totpEnabled || emailMfaEnabled) && recoveryCodes.length > 0 && (
                    <div className="border rounded-lg p-4 dark:border-gray-700">
                        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Recovery Codes
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Store these recovery codes in a secure password manager. They can be used to recover access to your account if your other authentication methods are unavailable.
                        </p>
                        
                        <div className="mb-4">
                            <button
                                type="button"
                                className="text-sm text-gray-600 underline dark:text-gray-400"
                                onClick={() => setShowingRecoveryCodes(!showingRecoveryCodes)}
                            >
                                {showingRecoveryCodes ? 'Hide Recovery Codes' : 'Show Recovery Codes'}
                            </button>
                        </div>

                        {showingRecoveryCodes && (
                            <div className="mb-4 rounded bg-gray-100 p-4 font-mono text-sm text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {recoveryCodes.map((code, index) => (
                                        <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                                            {code}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
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
            </div>
        </section>
    );
}
