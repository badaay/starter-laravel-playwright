import { Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface EmailVerificationBannerProps {
    user: {
        email_verified_at?: string | null | undefined;
        email: string;
    };
    className?: string;
    variant?: 'warning' | 'info' | 'danger';
    persistent?: boolean;
}

export default function EmailVerificationBanner({ 
    user, 
    className = '', 
    variant = 'warning',
    persistent = false 
}: EmailVerificationBannerProps) {
    const [dismissed, setDismissed] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(!!user.email_verified_at);

    // Check email verification status periodically
    useEffect(() => {
        const checkVerificationStatus = async () => {
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
                console.error('Failed to check verification status:', error);
            }
        };

        // Check immediately when component mounts
        checkVerificationStatus();

        // If not verified, check periodically
        if (!isEmailVerified) {
            const interval = setInterval(checkVerificationStatus, 30000); // Check every 30 seconds
            return () => clearInterval(interval);
        }
    }, [isEmailVerified]);

    // Update verification state when user prop changes
    useEffect(() => {
        setIsEmailVerified(!!user.email_verified_at);
    }, [user.email_verified_at]);

    // Don't show if email is already verified or banner is dismissed (unless persistent)
    if (isEmailVerified || (!persistent && dismissed)) {
        return null;
    }

    const variantStyles = {
        warning: {
            container: 'bg-yellow-50 border-l-4 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-500',
            icon: 'text-yellow-400 dark:text-yellow-500',
            title: 'text-yellow-800 dark:text-yellow-200',
            text: 'text-yellow-700 dark:text-yellow-300',
            button: 'text-yellow-800 bg-yellow-100 hover:bg-yellow-200 dark:text-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700',
            secondary: 'text-yellow-800 bg-transparent hover:bg-yellow-100 dark:text-yellow-200 dark:hover:bg-yellow-800/50',
            dismiss: 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-800/50'
        },
        info: {
            container: 'bg-blue-50 border-l-4 border-blue-400 dark:bg-blue-900/20 dark:border-blue-500',
            icon: 'text-blue-400 dark:text-blue-500',
            title: 'text-blue-800 dark:text-blue-200',
            text: 'text-blue-700 dark:text-blue-300',
            button: 'text-blue-800 bg-blue-100 hover:bg-blue-200 dark:text-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700',
            secondary: 'text-blue-800 bg-transparent hover:bg-blue-100 dark:text-blue-200 dark:hover:bg-blue-800/50',
            dismiss: 'bg-blue-50 text-blue-500 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-800/50'
        },
        danger: {
            container: 'bg-red-50 border-l-4 border-red-400 dark:bg-red-900/20 dark:border-red-500',
            icon: 'text-red-400 dark:text-red-500',
            title: 'text-red-800 dark:text-red-200',
            text: 'text-red-700 dark:text-red-300',
            button: 'text-red-800 bg-red-100 hover:bg-red-200 dark:text-red-200 dark:bg-red-800 dark:hover:bg-red-700',
            secondary: 'text-red-800 bg-transparent hover:bg-red-100 dark:text-red-200 dark:hover:bg-red-800/50',
            dismiss: 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-800/50'
        }
    };

    const styles = variantStyles[variant];

    return (
        <div className={`${styles.container} p-4 ${className}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    {variant === 'danger' ? (
                        <svg className={`h-5 w-5 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    ) : variant === 'info' ? (
                        <svg className={`h-5 w-5 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className={`h-5 w-5 ${styles.icon}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${styles.title}`}>
                        {variant === 'danger' ? 'Email Verification Required - Access Restricted' : 
                         variant === 'info' ? 'Email Verification Available' : 
                         'Email Verification Required'}
                    </h3>
                    <div className={`mt-2 text-sm ${styles.text}`}>
                        <p>
                            {variant === 'danger' ? (
                                <>Your email address <strong>{user.email}</strong> must be verified to continue. Some features are currently restricted.</>
                            ) : variant === 'info' ? (
                                <>You can verify your email address <strong>{user.email}</strong> to enable additional security features.</>
                            ) : (
                                <>Your email address <strong>{user.email}</strong> needs to be verified. Please verify your email to continue using all features.</>
                            )}
                        </p>
                    </div>
                    <div className="mt-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Link
                                href="/email-verification"
                                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${styles.button}`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Verify Email Now
                            </Link>
                        </div>
                    </div>
                </div>
                {!persistent && (
                    <div className="ml-auto pl-3">
                        <div className="-mx-1.5 -my-1.5">
                            <button
                                type="button"
                                onClick={() => setDismissed(true)}
                                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600 ${styles.dismiss}`}
                            >
                                <span className="sr-only">Dismiss</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
