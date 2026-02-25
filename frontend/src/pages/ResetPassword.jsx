import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState('');
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            setError('Invalid or missing reset token');
        } else {
            setToken(tokenParam);
        }
    }, [searchParams]);

    const calculateStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        if (password.match(/[^A-Za-z0-9]/)) strength += 25;
        return strength;
    };

    const passwordValue = String(formData.newPassword || '');
    const strength = calculateStrength(passwordValue);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.newPassword || !formData.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword({
                token: token,
                newPassword: formData.newPassword
            });
            setIsSubmitted(true);
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token && !error) {
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{
            background: `linear-gradient(to bottom right, var(--bg-gradient-from), var(--bg-gradient-to))`
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8 p-8 rounded-2xl shadow-xl border"
                style={{
                    background: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    boxShadow: 'var(--card-shadow)'
                }}
            >
                {!isSubmitted ? (
                    <>
                        <div>
                            <Link to="/login" className="flex items-center text-sm mb-4 transition-colors" style={{ color: 'var(--text-secondary)' }}>
                                <ArrowLeft size={16} className="mr-1" /> Back to Login
                            </Link>
                            <h2 className="mt-2 text-center text-3xl font-extrabold" style={{ color: 'var(--text-color)' }}>Create New Password</h2>
                            <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Enter your new password below
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-500 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5" />
                                {error}
                            </motion.div>
                        )}

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="relative">
                                <Input
                                    label="New Password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    icon={Lock}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-[38px] transition-colors z-10"
                                    style={{ color: 'var(--text-secondary)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>

                                {formData.newPassword && (
                                    <div className="mt-2 px-1">
                                        <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${strength}%` }}
                                                className="h-full"
                                                style={{
                                                    backgroundColor: strength <= 25 ? '#f87171' :
                                                        strength <= 50 ? '#fbbf24' :
                                                            strength <= 75 ? '#10b981' : 'var(--accent-color)'
                                                }}
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider mt-1 text-right" style={{ color: 'var(--text-secondary)' }}>
                                            {strength <= 25 ? 'Weak' : strength <= 50 ? 'Medium' : strength <= 75 ? 'Strong' : 'Excellent'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <Input
                                    label="Confirm Password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    icon={Lock}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-[38px] transition-colors z-10"
                                    style={{ color: 'var(--text-secondary)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                                Reset Password
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            type="spring"
                            className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6"
                            style={{
                                background: 'var(--accent-bg)',
                                color: 'var(--accent-color)'
                            }}
                        >
                            <CheckCircle className="h-8 w-8" />
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>Password Reset Successful!</h2>
                        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                            Your password has been reset successfully. <br />
                            Redirecting you to login...
                        </p>
                        <Link to="/login">
                            <Button variant="primary" className="w-full">
                                Go to Login
                            </Button>
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
