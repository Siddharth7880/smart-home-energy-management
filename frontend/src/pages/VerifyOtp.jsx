import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Zap, RefreshCcw, CheckCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import AnimatedBackground from '../components/AnimatedBackground';
import { verifyOtp, resendOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const email = location.state?.email || new URLSearchParams(location.search).get('email');
    const fromOAuth = new URLSearchParams(location.search).get('from') === 'oauth';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    // Timer for OTP expiry
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) {
            setCanResend(timeLeft === 0 || resendCooldown === 0);
            return;
        }

        const timer = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCooldown, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOtpChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        if (!/^\d{6}$/.test(pastedData)) {
            setError('Please paste a valid 6-digit code');
            return;
        }

        const newOtp = pastedData.split('');
        setOtp(newOtp);
        setError('');

        // Focus last input
        document.getElementById('otp-5')?.focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await verifyOtp(email, otpCode);

            if (response.status === 200 && response.data.accessToken) {
                // JWT token received - auto login
                const userData = {
                    accessToken: response.data.accessToken,
                    id: response.data.id,
                    username: response.data.username,
                    email: response.data.email,
                    roles: response.data.roles || ['ROLE_HOMEOWNER']
                };

                // Save to localStorage
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(userData));

                // Update auth context
                login(userData);

                setSuccess(true);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (err) {
            let errorMessage = 'Verification failed';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (typeof err.response?.data === 'string') {
                errorMessage = err.response.data;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setIsResending(true);
        setError('');

        try {
            await resendOtp(email);
            setTimeLeft(900); // Reset to 15 minutes
            setResendCooldown(60); // 60 second cooldown
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            setError('Failed to resend code. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    if (!email) return null;

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <AnimatedBackground />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full relative z-10"
            >
                <motion.div
                    className="p-12 rounded-3xl border shadow-2xl"
                    style={{
                        background: 'var(--card-bg)',
                        borderColor: 'rgba(34, 197, 94, 0.2)',
                        boxShadow: '0 20px 40px rgba(34, 197, 94, 0.15)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.9, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg border"
                            style={{
                                background: `linear-gradient(to bottom right, var(--accent-color), var(--accent-hover))`,
                                borderColor: 'var(--accent-color)',
                                boxShadow: '0 10px 15px -3px rgba(var(--accent-color-rgb), 0.3)'
                            }}
                        >
                            {success ? (
                                <CheckCircle className="h-10 w-10 text-white" />
                            ) : (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                                    <Mail className="h-10 w-10 text-white" />
                                </motion.div>
                            )}
                        </motion.div>

                        <h2 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-color)' }}>
                            {success ? 'Verified!' : 'Verify Your Email'}
                        </h2>
                        <p className="mt-3 text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {success
                                ? 'Taking you to your dashboard...'
                                : fromOAuth
                                    ? `Please verify your email: ${email}`
                                    : `We sent a 6-digit code to ${email}`
                            }
                        </p>
                    </div>

                    {!success && (
                        <form onSubmit={handleVerify} className="space-y-8">
                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-500 text-sm font-bold text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* OTP Input - Large Size */}
                            <div className="flex justify-center gap-3">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className="w-16 h-20 text-center text-3xl font-black rounded-xl border-2 focus:outline-none focus:ring-4 transition-all shadow-lg"
                                        style={{
                                            background: 'var(--input-bg)',
                                            borderColor: digit ? 'var(--accent-color)' : 'var(--border-color)',
                                            color: 'var(--text-color)',
                                            boxShadow: digit
                                                ? '0 0 0 3px rgba(var(--accent-color-rgb), 0.1)'
                                                : '0 4px 6px rgba(0, 0, 0, 0.05)'
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Timer */}
                            <div className="text-center">
                                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                    Code expires in:
                                    <span
                                        className={`ml-2 text-lg ${timeLeft < 60 ? 'text-red-500' : ''}`}
                                        style={{ color: timeLeft < 60 ? '#ef4444' : 'var(--accent-color)' }}
                                    >
                                        {formatTime(timeLeft)}
                                    </span>
                                </p>
                            </div>

                            {/* Verify Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full h-16 rounded-2xl text-lg font-black tracking-widest uppercase shadow-lg"
                                isLoading={isLoading}
                                disabled={isLoading || success}
                            >
                                Verify Email
                            </Button>

                            {/* Resend OTP */}
                            <div className="text-center space-y-3">
                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                    Didn't receive the code?
                                </p>
                                <motion.button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={!canResend || isResending}
                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all ${canResend && !isResending
                                        ? 'shadow-md hover:shadow-lg'
                                        : 'opacity-50 cursor-not-allowed'
                                        }`}
                                    style={{
                                        background: canResend && !isResending ? 'var(--accent-color)' : 'var(--border-color)',
                                        color: canResend && !isResending ? 'white' : 'var(--text-secondary)'
                                    }}
                                    whileHover={canResend && !isResending ? { scale: 1.02 } : {}}
                                    whileTap={canResend && !isResending ? { scale: 0.98 } : {}}
                                >
                                    <RefreshCcw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                                    {isResending
                                        ? 'Sending...'
                                        : resendCooldown > 0
                                            ? `Resend (${resendCooldown}s)`
                                            : 'Resend Code'
                                    }
                                </motion.button>
                            </div>

                            {/* Back to Register */}
                            <div className="text-center pt-4">
                                <motion.button
                                    type="button"
                                    onClick={() => navigate('/register')}
                                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors"
                                    style={{ color: 'var(--text-secondary)' }}
                                    whileHover={{ x: -2 }}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Register
                                </motion.button>
                            </div>
                        </form>
                    )}

                    {success && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-8"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="mb-6"
                            >
                                <CheckCircle className="h-24 w-24 mx-auto" style={{ color: 'var(--accent-color)' }} />
                            </motion.div>
                            <p className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>
                                Your email has been verified!
                            </p>
                            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Taking you to your dashboard...
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default VerifyOtp;
