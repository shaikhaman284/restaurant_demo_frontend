import React, { useState } from 'react';
import { X } from 'lucide-react';
import apiService from '../../services/apiService';
import { useAuthStore } from '../../store/useStore';

interface Props {
    onClose: () => void;
    tableId: string;
}

const OTPVerificationModal: React.FC<Props> = ({ onClose, tableId }) => {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('+91');
    const [otp, setOTP] = useState('');
    const [receivedOTP, setReceivedOTP] = useState(''); // Store OTP for demo display
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { setCustomerSession } = useAuthStore();

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiService.post('/auth/customer/request-otp', { phone, name });

            // Store OTP for demo display
            if (response.data.otp) {
                setReceivedOTP(response.data.otp);

                // Also display OTP in browser console for demo purposes
                console.clear();
                console.log('%c╔════════════════════════════════════════╗', 'color: #10b981; font-weight: bold; font-size: 14px;');
                console.log('%c║          🔐 YOUR OTP CODE             ║', 'color: #10b981; font-weight: bold; font-size: 14px;');
                console.log('%c╠════════════════════════════════════════╣', 'color: #10b981; font-weight: bold; font-size: 14px;');
                console.log(`%c║  OTP: ${response.data.otp}                           ║`, 'color: #10b981; font-weight: bold; font-size: 16px;');
                console.log(`%c║  Phone: ${phone}                 ║`, 'color: #10b981; font-weight: bold; font-size: 14px;');
                console.log(`%c║  Expires in: ${response.data.expiresIn} minutes              ║`, 'color: #10b981; font-weight: bold; font-size: 14px;');
                console.log('%c╚════════════════════════════════════════╝', 'color: #10b981; font-weight: bold; font-size: 14px;');
                console.log('%c\n👆 OTP is also displayed on screen for demo purposes', 'color: #f59e0b; font-weight: bold; font-size: 12px;');
            }

            setStep('otp');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiService.post('/auth/customer/verify-otp', {
                phone,
                name,
                otp,
                tableId,
            });

            setCustomerSession(response.data.sessionToken, response.data.customer, tableId);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-6">Verify Your Identity</h2>

                {step === 'phone' ? (
                    <form onSubmit={handleRequestOTP} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field"
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mobile Number
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="input-field"
                                placeholder="+91XXXXXXXXXX"
                                required
                                pattern="\+91\d{10}"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        {/* Demo OTP Display Banner */}
                        {receivedOTP && (
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-lg shadow-lg border-2 border-emerald-400">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold uppercase tracking-wide">🔐 Demo OTP Code</span>
                                    <span className="text-xs bg-white/20 px-2 py-1 rounded">For Testing</span>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold tracking-widest mb-1 font-mono">
                                        {receivedOTP}
                                    </div>
                                    <p className="text-xs text-emerald-100">
                                        Copy this code and paste it below
                                    </p>
                                </div>
                            </div>
                        )}

                        <p className="text-sm text-gray-600">
                            OTP sent to {phone}
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOTP(e.target.value)}
                                className="input-field text-center text-2xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep('phone')}
                                className="btn-secondary flex-1"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1"
                            >
                                {loading ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default OTPVerificationModal;
