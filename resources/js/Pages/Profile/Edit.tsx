import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import MfaForm from './Partials/MfaForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import EmailVerificationBanner from '@/Components/EmailVerificationBanner';
import { useState } from 'react';

export default function Edit({
    auth,
    mustVerifyEmail,
    status,
    mfaEnabled = false,
    totpEnabled = false,
    emailMfaEnabled = false,
    recoveryCodes = [],
}: PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
    mfaEnabled?: boolean;
    totpEnabled?: boolean;
    emailMfaEnabled?: boolean;
    recoveryCodes?: string[];
}>) {
    const [activeTab, setActiveTab] = useState('profile');

    // Define the menu items and their corresponding sections
    const menuItems = [
        { id: 'profile', label: 'Profile Information', icon: 'user' },
        { id: 'password', label: 'Password', icon: 'key' },
        { id: 'mfa', label: 'Two-Factor Authentication', icon: 'shield-check' },
        { id: 'delete', label: 'Delete Account', icon: 'trash', danger: true },
    ];

    // Function to render the appropriate icon
    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case 'user':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                );
            case 'key':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                );
            case 'shield-check':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                );
            case 'code':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case 'trash':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Success Message */}
                    {status === 'email-verified' && (
                        <div className="mb-6 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                        Email Verified Successfully!
                                    </h3>
                                    <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                        <p>
                                            Your email address has been verified. You can now access all features of the application.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email Verification Banner */}
                    <EmailVerificationBanner 
                        user={auth.user} 
                        className="mb-6"
                        variant={auth.user.email_verified_at ? 'info' : 'danger'}
                        persistent={!auth.user.email_verified_at}
                    />
                    
                    <div className="flex flex-col md:flex-row">
                        {/* Left-side navigation menu */}
                        <div className="w-full md:w-64 shrink-0 mb-6 md:mb-0 md:mr-6">
                            <div className="bg-white rounded-lg shadow dark:bg-gray-800">
                                <div className="p-4 border-b dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Settings
                                    </h3>
                                </div>

                                <nav className="p-2">
                                    <ul>
                                        {menuItems.map((item) => (
                                            <li key={item.id} className="mb-1">
                                                <button
                                                    onClick={() => setActiveTab(item.id)}
                                                    className={`w-full flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                                        activeTab === item.id
                                                            ? item.danger
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                                : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                                                            : item.danger
                                                                ? 'text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                                                                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                                                    }`}
                                                >
                                                    <span className="mr-3">
                                                        {renderIcon(item.icon)}
                                                    </span>
                                                    {item.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        </div>

                        {/* Main content area */}
                        <div className="flex-1">
                            <div className={`bg-white p-6 shadow sm:rounded-lg dark:bg-gray-800 ${activeTab !== 'profile' ? 'hidden' : ''}`}>
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </div>

                            <div className={`bg-white p-6 shadow sm:rounded-lg dark:bg-gray-800 ${activeTab !== 'password' ? 'hidden' : ''}`}>
                                <UpdatePasswordForm className="max-w-xl" />
                            </div>

                            <div className={`bg-white p-6 shadow sm:rounded-lg dark:bg-gray-800 ${activeTab !== 'mfa' ? 'hidden' : ''}`}>
                                <MfaForm
                                    className="max-w-xl"
                                    user={auth.user}
                                    mfaEnabled={mfaEnabled}
                                    totpEnabled={totpEnabled}
                                    emailMfaEnabled={emailMfaEnabled}
                                    recoveryCodes={recoveryCodes}
                                />
                            </div>

                            <div className={`bg-white p-6 shadow sm:rounded-lg dark:bg-gray-800 ${activeTab !== 'delete' ? 'hidden' : ''}`}>
                                <DeleteUserForm className="max-w-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
