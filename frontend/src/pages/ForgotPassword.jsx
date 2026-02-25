import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            await forgotPassword(email);
            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
            // Typically we don't show error for security, but logging it
            setIsSubmitted(true); // Fake success to prevent enumeration
        } finally {
            setIsLoading(false);
        }
    };

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
                            <h2 className="mt-2 text-center text-3xl font-extrabold" style={{ color: 'var(--text-color)' }}>Reset Password</h2>
                            <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Enter your email address to receive a reset link
                            </p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                                Send Reset Link
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
                        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>Check your email</h2>
                        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                            We've sent a password reset link to <br />
                            <span className="font-medium" style={{ color: 'var(--text-color)' }}>{email}</span>
                        </p>
                        <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                            Try another email
                        </Button>
                        <div className="mt-4">
                            <Link to="/login" className="text-sm font-medium transition-colors" style={{ color: 'var(--accent-color)' }}>
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
