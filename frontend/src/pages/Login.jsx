import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Zap, Mail, Lock, AlertCircle, Leaf } from 'lucide-react';
import { login as loginApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = ({ isModal = false, onSwitch }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ usernameOrEmail: '', password: '', rememberMe: false });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState({});
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        const errorParam = searchParams.get('error');
        const errorType = searchParams.get('type');
        if (errorParam && errorType === 'oauth_error') {
            setError(decodeURIComponent(errorParam));
        }
    }, [searchParams]);

    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleBlur = useCallback((field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setFocusedField(null);
    }, []);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isEmailValid = formData.usernameOrEmail && formData.usernameOrEmail.length >= 3;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.usernameOrEmail || !formData.password) {
            setError("Please fill in all fields");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await loginApi({ username: formData.usernameOrEmail, password: formData.password });
            if (response.status === 200 && response.data) {
                const storage = formData.rememberMe ? localStorage : sessionStorage;
                if (response.data.accessToken) storage.setItem('token', response.data.accessToken);
                login(response.data, formData.rememberMe);
                setIsLoading(false);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please check your credentials.");
            setIsLoading(false);
        }
    };

    const content = (
        <div className="w-full">
            {/* Logo & Header */}
            {!isModal && (
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                        className="mx-auto mb-6 relative"
                        style={{ width: 'fit-content' }}
                    >
                        <div className="h-20 w-20 rounded-3xl flex items-center justify-center mx-auto"
                            style={{
                                background: 'linear-gradient(135deg, #10B981, #22C55E)',
                                boxShadow: '0 0 40px rgba(16,185,129,0.6), 0 0 80px rgba(16,185,129,0.2)',
                            }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                                <Zap className="h-10 w-10 text-white drop-shadow-lg" />
                            </motion.div>
                        </div>
                        <motion.div
                            className="absolute inset-0 rounded-3xl border-2"
                            style={{ borderColor: 'var(--accent-glow)', margin: '-4px' }}
                            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="text-4xl font-black tracking-tight mb-2"
                        style={{ color: 'var(--text-color)' }}
                    >
                        Welcome Back
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-sm font-semibold uppercase tracking-widest flex items-center justify-center gap-2"
                        style={{ color: '#10B981' }}
                    >
                        <Leaf size={14} />
                        Smart Home Energy Management System
                    </motion.p>
                </div>
            )}

            <form className={`space-y-5 ${!isModal ? 'mt-2' : ''}`} onSubmit={handleSubmit}>
                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="flex items-center gap-3 p-4 rounded-xl border text-sm font-semibold"
                            style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)', color: '#EF4444' }}
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Email Field */}
                <div>
                    <label
                        className="block text-xs font-bold uppercase tracking-widest mb-2"
                        style={{ color: focusedField === 'email' ? '#10B981' : 'var(--text-secondary)' }}
                    >
                        Email or Username
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300"
                            style={{ color: focusedField === 'email' ? '#10B981' : 'var(--text-secondary)' }}>
                            <Mail size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="username or email@example.com"
                            value={formData.usernameOrEmail}
                            onChange={(e) => handleChange('usernameOrEmail', e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => handleBlur('email')}
                            className="w-full pl-12 pr-4 py-4 rounded-xl text-sm font-medium transition-all duration-300 outline-none"
                            style={{
                                background: focusedField === 'email' ? 'rgba(16,185,129,0.08)' : 'var(--input-bg)',
                                border: `2px solid ${focusedField === 'email' ? '#10B981' : touched.email && !isEmailValid ? 'rgba(239,68,68,0.6)' : 'var(--input-border)'}`,
                                color: 'var(--text-color)',
                                boxShadow: focusedField === 'email' ? '0 0 20px rgba(16,185,129,0.2)' : 'none',
                            }}
                        />
                        {touched.email && isEmailValid && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#10B981' }}>
                                <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                {/* Password Field */}
                <div>
                    <label
                        className="block text-xs font-bold uppercase tracking-widest mb-2"
                        style={{ color: focusedField === 'password' ? '#10B981' : 'var(--text-secondary)' }}
                    >
                        Password
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300"
                            style={{ color: focusedField === 'password' ? '#10B981' : 'var(--text-secondary)' }}>
                            <Lock size={18} />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => handleBlur('password')}
                            className="w-full pl-12 pr-14 py-4 rounded-xl text-sm font-medium transition-all duration-300 outline-none"
                            style={{
                                background: focusedField === 'password' ? 'rgba(16,185,129,0.08)' : 'var(--input-bg)',
                                border: `2px solid ${focusedField === 'password' ? '#10B981' : 'var(--input-border)'}`,
                                color: 'var(--text-color)',
                                boxShadow: focusedField === 'password' ? '0 0 20px rgba(16,185,129,0.2)' : 'none',
                            }}
                        />
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors z-10"
                            style={{ color: showPassword ? '#10B981' : 'var(--text-secondary)' }}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Remember Me + Forgot Password */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={formData.rememberMe}
                                onChange={(e) => handleChange('rememberMe', e.target.checked)}
                            />
                            <motion.div
                                className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300 pointer-events-none"
                                animate={{
                                    background: formData.rememberMe ? '#10B981' : 'transparent',
                                    borderColor: formData.rememberMe ? '#10B981' : 'var(--input-border)',
                                    boxShadow: formData.rememberMe ? '0 0 12px rgba(16,185,129,0.5)' : 'none'
                                }}
                            >
                                <AnimatePresence>
                                    {formData.rememberMe && (
                                        <motion.svg initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                                            className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </motion.svg>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Remember Me</span>
                    </label>
                    <Link to="/forgot-password" className="text-xs font-bold uppercase tracking-widest transition-colors hover:opacity-80" style={{ color: '#10B981' }}>
                        Forgot Password?
                    </Link>
                </div>

                {/* Login Button */}
                <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 rounded-xl font-black text-sm uppercase tracking-widest text-white relative overflow-hidden transition-all duration-300"
                    style={{
                        background: isLoading ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg, #10B981, #22C55E)',
                        boxShadow: isLoading ? 'none' : '0 8px 32px rgba(16,185,129,0.4)',
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                    {!isLoading && (
                        <motion.div
                            className="absolute inset-0 w-full h-full"
                            style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)', backgroundSize: '200% 100%' }}
                            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                        />
                    )}
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-3">
                            <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                            Signing In...
                        </div>
                    ) : (
                        <span className="relative z-10 flex items-center justify-center gap-2"><Zap size={16} /> Sign In</span>
                    )}
                </motion.button>

                {/* Divider */}
                <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" style={{ borderColor: 'var(--navbar-border)' }} />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 text-xs font-bold uppercase tracking-widest"
                            style={{ background: 'var(--card-bg)', color: 'var(--text-secondary)' }}>
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Google Sign-In */}
                <motion.button
                    type="button"
                    onClick={() => { window.location.href = 'http://localhost:8080/oauth2/authorization/google'; }}
                    className="w-full py-3.5 rounded-xl font-bold tracking-wide text-sm flex items-center justify-center gap-3 transition-all border-2"
                    style={{ background: 'var(--glass-surface)', borderColor: 'var(--glass-border)', color: 'var(--text-color)' }}
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M19.8 10.2273C19.8 9.51824 19.7364 8.83642 19.6182 8.18188H10.2V12.0501H15.6109C15.3764 13.3001 14.6582 14.3592 13.5864 15.0682V17.5773H16.8182C18.7091 15.8364 19.8 13.2728 19.8 10.2273Z" fill="#4285F4" />
                        <path d="M10.2 20C12.8 20 14.9636 19.1045 16.8182 17.5773L13.5864 15.0682C12.6818 15.6682 11.5455 16.0227 10.2 16.0227C7.69091 16.0227 5.58182 14.2636 4.78182 11.9H1.43636V14.4909C3.27273 18.1409 6.46364 20 10.2 20Z" fill="#34A853" />
                        <path d="M4.78182 11.9C4.58182 11.3 4.46364 10.6591 4.46364 10C4.46364 9.34091 4.58182 8.7 4.78182 8.1V5.50909H1.43636C0.763636 6.85909 0.363636 8.38636 0.363636 10C0.363636 11.6136 0.763636 13.1409 1.43636 14.4909L4.78182 11.9Z" fill="#FBBC05" />
                        <path d="M10.2 3.97727C11.6636 3.97727 12.9636 4.48182 13.9909 5.45455L16.8636 2.58182C14.9591 0.786364 12.7955 0 10.2 0C6.46364 0 3.27273 1.85909 1.43636 5.50909L4.78182 8.1C5.58182 5.73636 7.69091 3.97727 10.2 3.97727Z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                </motion.button>

                {/* Register Link */}
                <div className="text-center pt-2">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        {isModal ? (
                            <button type="button" onClick={onSwitch} className="font-bold transition-colors hover:opacity-80" style={{ color: '#10B981' }}>
                                Create Account →
                            </button>
                        ) : (
                            <Link to="/register" className="font-bold transition-colors hover:opacity-80" style={{ color: '#10B981' }}>
                                Create Account →
                            </Link>
                        )}
                    </p>
                </div>
            </form>
        </div>
    );

    if (isModal) return content;

    return (
        <div className="min-h-screen w-full flex items-center justify-center py-10 px-4 sm:px-8 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--page-bg-from) 0%, var(--page-bg-mid) 50%, var(--page-bg-to) 100%)', transition: 'background 0.4s ease' }}>

            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div className="absolute rounded-full blur-3xl"
                    style={{ width: 500, height: 500, top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(16,185,129,0.15), transparent)' }}
                    animate={{ x: [0, 80, 0], y: [0, 60, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
                <motion.div className="absolute rounded-full blur-3xl"
                    style={{ width: 400, height: 400, bottom: '-5%', right: '-5%', background: 'radial-gradient(circle, rgba(34,197,94,0.12), transparent)' }}
                    animate={{ x: [0, -60, 0], y: [0, -80, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
                <motion.div className="absolute rounded-full blur-3xl"
                    style={{ width: 300, height: 300, top: '40%', left: '40%', background: 'radial-gradient(circle, rgba(16,185,129,0.08), transparent)' }}
                    animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }} transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 5 }} />
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(var(--navbar-border) 1px, transparent 1px), linear-gradient(90deg, var(--navbar-border) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px', opacity: 0.3
                }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="flex gap-16 max-w-6xl w-full relative z-10 items-center"
            >
                {/* Left Info Panel */}
                <div className="hidden lg:flex flex-col flex-1 space-y-8 pr-8">
                    <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-2xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #10B981, #22C55E)', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--text-color)' }}>ECOSMART</span>
                        </div>
                        <h1 className="text-5xl font-black leading-tight mb-4" style={{ color: 'var(--text-color)' }}>
                            Smart Energy<br />
                            <span style={{ color: '#10B981' }}>Management</span>
                        </h1>
                        <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Monitor, optimize, and control your home's energy consumption with AI-powered insights.
                        </p>
                    </motion.div>

                    {[
                        { icon: '⚡', label: 'Real-time monitoring' },
                        { icon: '🌱', label: 'Eco savings tracker' },
                        { icon: '🔒', label: 'Secure & encrypted' },
                    ].map((f, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                            className="flex items-center gap-4 p-4 rounded-2xl border"
                            style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.15)' }}>
                            <span className="text-2xl">{f.icon}</span>
                            <span className="font-semibold" style={{ color: 'var(--text-color)' }}>{f.label}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="flex-1 w-full lg:max-w-md p-10 rounded-3xl border relative overflow-hidden"
                    style={{
                        background: 'var(--glass-surface)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        borderColor: 'var(--glass-border)',
                        boxShadow: '0 32px 64px rgba(0,0,0,0.2), 0 0 0 1px var(--navbar-border) inset',
                    }}
                >
                    <div className="absolute top-0 left-0 right-0 h-px"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)' }} />
                    {content}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
