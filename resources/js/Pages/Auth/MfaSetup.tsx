import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';

interface Props {
    qrCodeSvg: string;
    secretKey: string;
    recoveryCodes: string[];
}

export default function MfaSetup({ qrCodeSvg, secretKey, recoveryCodes }: Props) {
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('mfa.enable'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Set Up Two-Factor Authentication</h2>}
        >
            <Head title="Set Up Two-Factor Authentication" />

            <div className="py-4 flex flex-col h-[calc(100vh-10rem)]">
                <div className="mx-auto max-w-7xl w-full flex-1 flex flex-col sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800 flex-1 flex flex-col">
                        <div className="p-4 md:p-8 text-gray-900 dark:text-gray-100 flex-1 flex flex-col">
                            <div className="flex-1 flex flex-col">
                                <h3 className="mb-3 text-2xl font-medium text-center">Scan the QR Code</h3>
                                <p className="mb-8 text-center text-sm text-gray-600 dark:text-gray-400">
                                    Scan the QR code below with your two-factor authentication app
                                    (like Google Authenticator, Authy, or Microsoft Authenticator).
                                </p>

                                <div className="flex-1 flex flex-col md:flex-row gap-8">
                                    {/* Left Side - QR Code */}
                                    <div className="md:w-2/3 flex items-center justify-center py-6 px-4 flex-1">
                                        <div className="bg-white p-10 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 w-full h-full flex items-center justify-center">
                                            <div className="transform scale-150" dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
                                        </div>
                                    </div>

                                    {/* Right Side - Verification Form */}
                                    <div className="md:w-1/3 flex flex-col">
                                        <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between flex-1">
                                            <div className="mb-8">
                                                <p className="text-sm mb-3 text-gray-600 dark:text-gray-400">
                                                    If you can't scan the QR code, you can manually enter this code:
                                                </p>
                                                <code className="block rounded bg-gray-100 p-4 font-mono text-center text-sm dark:bg-gray-700">
                                                    {secretKey}
                                                </code>
                                            </div>

                                            <div className="mb-8">
                                                <InputLabel htmlFor="code" value="Verification Code" className="text-lg" />
                                                <TextInput
                                                    id="code"
                                                    type="text"
                                                    name="code"
                                                    value={data.code}
                                                    className="mt-2 block w-full text-lg"
                                                    onChange={(e) => setData('code', e.target.value)}
                                                    required
                                                    autoFocus
                                                    placeholder="Enter the 6-digit code"
                                                />
                                                <InputError message={errors.code} className="mt-2" />
                                            </div>

                                            <div className="mt-auto">
                                                <PrimaryButton className="w-full justify-center py-3 text-lg" disabled={processing}>
                                                    Verify and Enable
                                                </PrimaryButton>

                                                <div className="mt-6">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
                                                        className="w-full text-center text-sm text-gray-600 underline dark:text-gray-400"
                                                    >
                                                        {showRecoveryCodes ? 'Hide' : 'Show'} Recovery Codes
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {showRecoveryCodes && (
                                <div className="mt-8 border-t pt-8 border-gray-200 dark:border-gray-700">
                                    <h3 className="mb-4 text-xl font-medium">Recovery Codes</h3>
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <div className="mb-4 md:w-1/2">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <strong className="block mb-2">Important:</strong>
                                                Store these recovery codes in a secure password manager or other secure location.
                                                If you lose access to your authenticator app, these codes will be the only way to access your account.
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                                                Each code can only be used once.
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-gray-100 p-5 font-mono text-sm dark:bg-gray-700 md:w-1/2 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {recoveryCodes.map((code, index) => (
                                                    <div key={index} className="p-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                                                        {code}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
