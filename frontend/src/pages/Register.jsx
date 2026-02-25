import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, User, Mail, Lock, ShieldCheck, UserCog, AlertCircle, Home, Wrench, Crown } from 'lucide-react';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

// InputField defined OUTSIDE component to prevent re-mount on parent re-render
const InputField = ({ label, name, placeholder, type = 'text', icon: Icon, rightElement, value, onChange, onFocus, onBlur, focusedField, touched, error, isValid }) => (
    <div>
        <label
            className="block text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: focusedField === name ? '#10B981' : 'var(--text-secondary)', transition: 'color 0.3s' }}
        >
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: focusedField === name ? '#10B981' : 'var(--text-secondary)', transition: 'color 0.3s' }}>
                    <Icon size={16} />
                </div>
            )}
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onFocus={() => onFocus(name)}
                onBlur={() => onBlur(name)}
                className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-300 outline-none"
                style={{
                    paddingLeft: Icon ? '2.75rem' : '1rem',
                    paddingRight: rightElement ? '3rem' : (touched && isValid ? '3rem' : '1rem'),
                    background: focusedField === name ? 'rgba(16,185,129,0.08)' : 'var(--input-bg)',
                    border: `2px solid ${focusedField === name ? '#10B981' : error ? 'rgba(239,68,68,0.6)' : 'var(--input-border)'}`,
                    color: 'var(--text-color)',
                    boxShadow: focusedField === name ? '0 0 16px rgba(16,185,129,0.15)' : 'none',
                }}
            />
            {rightElement}
            {touched && isValid && !rightElement && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#10B981' }}>
                    <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
            )}
        </div>
        <AnimatePresence>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -5, height: 0 }}
                    className="text-xs font-semibold mt-1.5 flex items-center gap-1"
                    style={{ color: '#EF4444' }}
                >
                    <AlertCircle size={12} /> {error}
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);

const Register = ({ isModal = false, onSwitch }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', username: '', email: '',
        password: '', confirmPassword: '', role: ['homeowner']
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [touched, setTouched] = useState({});
    const [focusedField, setFocusedField] = useState(null);

    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleBlur = useCallback((field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setFocusedField(null);
    }, []);

    const calculateStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        if (password.match(/[^A-Za-z0-9]/)) strength += 25;
        return strength;
    };

    const passwordValue = String(formData.password || '');
    const confirmPasswordValue = String(formData.confirmPassword || '');
    const strength = calculateStrength(passwordValue);

    const getStrengthLabel = () => {
        if (strength <= 25) return { label: 'Weak', color: '#EF4444' };
        if (strength <= 50) return { label: 'Fair', color: '#F59E0B' };
        if (strength <= 75) return { label: 'Good', color: '#10B981' };
        return { label: 'Strong', color: '#22C55E' };
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validateUsername = (username) => username.length >= 3;
    const validatePassword = (pwd) => pwd.length >= 8;
    const passwordsMatch = passwordValue === confirmPasswordValue && passwordValue;

    const validate = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = "First Name is required";
        if (!formData.lastName) newErrors.lastName = "Last Name is required";
        if (!formData.username) newErrors.username = "Username is required";
        else if (!validateUsername(formData.username)) newErrors.username = "Username must be at least 3 characters";
        if (!formData.email) newErrors.email = "Email is required";
        else if (!validateEmail(formData.email)) newErrors.email = "Email is invalid";
        if (!passwordValue) newErrors.password = "Password is required";
        else if (!validatePassword(passwordValue)) newErrors.password = "Password must be at least 8 characters";
        if (passwordValue !== confirmPasswordValue) newErrors.confirmPassword = "Passwords do not match";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsLoading(true);
        try {
            const registerResponse = await register({
                firstName: formData.firstName, lastName: formData.lastName,
                username: formData.username, email: formData.email,
                password: formData.password, role: formData.role
            });
            if (registerResponse.status === 200) {
                setIsLoading(false);
                navigate('/verify-otp', { state: { email: formData.email } });
            } else {
                setIsLoading(false);
                setErrors({ ...errors, general: "Registration failed. Please try again." });
            }
        } catch (err) {
            let errorMessage = "Registration failed";
            if (err.response) {
                if (typeof err.response.data === 'string') errorMessage = err.response.data;
                else if (err.response.data && typeof err.response.data === 'object')
                    errorMessage = err.response.data.message || JSON.stringify(err.response.data);
            } else if (err.message) errorMessage = err.message;
            setErrors({ ...errors, general: errorMessage });
            setIsLoading(false);
        }
    };

    const roles = [
        { value: 'homeowner', label: 'Homeowner', desc: 'Monitor your home energy usage', icon: Home, color: '#10B981', glow: 'rgba(16,185,129,0.3)' },
        { value: 'technician', label: 'Technician', desc: 'Manage and maintain systems', icon: Wrench, color: '#60A5FA', glow: 'rgba(96,165,250,0.3)' },
        { value: 'admin', label: 'Admin', desc: 'Full platform control', icon: Crown, color: '#F59E0B', glow: 'rgba(245,158,11,0.3)' }
    ];

    const content = (
        <div className="w-full">
            {/* Header */}
            {!isModal && (
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
                        className="mx-auto mb-5"
                        style={{ width: 'fit-content' }}
                    >
                        <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto relative"
                            style={{ background: 'linear-gradient(135deg, #10B981, #22C55E)', boxShadow: '0 0 30px rgba(16,185,129,0.5)' }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                                <Zap className="h-8 w-8 text-white drop-shadow-md" />
                            </motion.div>
                        </div>
                    </motion.div>
                    <h2 className="text-3xl font-black tracking-tight mb-1" style={{ color: 'var(--text-color)' }}>Join EcoSmart</h2>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#10B981' }}>Start Your Energy Journey</p>
                </div>
            )}

            <form className={`space-y-4 ${!isModal ? 'mt-2' : ''}`} onSubmit={handleSubmit}>
                {/* General Error */}
                <AnimatePresence>
                    {errors.general && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="flex items-center gap-3 p-3.5 rounded-xl border text-sm font-semibold"
                            style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)', color: '#EF4444' }}
                        >
                            <AlertCircle size={16} />
                            {errors.general}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Name Row */}
                <div className="grid grid-cols-2 gap-3">
                    <InputField
                        label="First Name" name="firstName" placeholder="John" icon={User}
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        onFocus={setFocusedField} onBlur={handleBlur}
                        focusedField={focusedField} touched={touched.firstName}
                        error={touched.firstName && errors.firstName}
                        isValid={formData.firstName.length > 0}
                    />
                    <InputField
                        label="Last Name" name="lastName" placeholder="Doe" icon={User}
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        onFocus={setFocusedField} onBlur={handleBlur}
                        focusedField={focusedField} touched={touched.lastName}
                        error={touched.lastName && errors.lastName}
                        isValid={formData.lastName.length > 0}
                    />
                </div>

                {/* Username */}
                <InputField
                    label="Username" name="username" placeholder="johndoe" icon={ShieldCheck}
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    onFocus={setFocusedField} onBlur={handleBlur}
                    focusedField={focusedField} touched={touched.username}
                    error={touched.username && errors.username}
                    isValid={validateUsername(formData.username)}
                />

                {/* Email */}
                <InputField
                    label="Email Address" name="email" type="email" placeholder="user@example.com" icon={Mail}
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onFocus={setFocusedField} onBlur={handleBlur}
                    focusedField={focusedField} touched={touched.email}
                    error={touched.email && errors.email}
                    isValid={validateEmail(formData.email)}
                />

                {/* Role Selector */}
                <div>
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
                        <UserCog size={14} /> Select Your Role
                    </label>
                    <div className="flex gap-2">
                        {roles.map((role) => {
                            const isSelected = formData.role.includes(role.value);
                            const RoleIcon = role.icon;
                            return (
                                <motion.button
                                    key={role.value}
                                    type="button"
                                    onClick={() => handleChange('role', [role.value])}
                                    className="flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all duration-300 relative overflow-hidden"
                                    style={{
                                        borderColor: isSelected ? role.color : 'var(--input-border)',
                                        background: isSelected ? `${role.glow.replace('0.3)', '0.1)')}` : 'var(--glass-surface)',
                                        boxShadow: isSelected ? `0 0 20px ${role.glow}` : 'none',
                                    }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <RoleIcon size={18} style={{ color: isSelected ? role.color : 'var(--text-secondary)', position: 'relative', zIndex: 1 }} />
                                    <span className="text-xs font-bold relative z-10" style={{ color: isSelected ? role.color : 'var(--text-secondary)' }}>
                                        {role.label}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: role.color }}>
                                            <svg viewBox="0 0 10 10" className="w-2 h-2 text-white" fill="none">
                                                <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                        {roles.find(r => r.value === formData.role[0])?.desc}
                    </p>
                </div>

                {/* Password */}
                <div>
                    <InputField
                        label="Password" name="password" placeholder="••••••••" icon={Lock}
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        onFocus={setFocusedField} onBlur={handleBlur}
                        focusedField={focusedField} touched={touched.password}
                        error={touched.password && errors.password}
                        isValid={validatePassword(formData.password)}
                        rightElement={
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors z-10"
                                style={{ color: showPassword ? '#10B981' : 'var(--text-secondary)' }}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        }
                    />
                    {/* Password Strength Bar */}
                    <AnimatePresence>
                        {passwordValue && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2.5"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Strength</span>
                                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: getStrengthLabel().color }}>
                                        {getStrengthLabel().label}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    {[25, 50, 75, 100].map((threshold, i) => (
                                        <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                                            <motion.div
                                                className="h-full rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: strength >= threshold ? '100%' : '0%' }}
                                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                                style={{ background: getStrengthLabel().color }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Confirm Password */}
                <InputField
                    label="Confirm Password" name="confirmPassword" placeholder="••••••••" icon={Lock}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    onFocus={setFocusedField} onBlur={handleBlur}
                    focusedField={focusedField} touched={touched.confirmPassword}
                    error={touched.confirmPassword && errors.confirmPassword}
                    isValid={!!passwordsMatch}
                    rightElement={
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors z-10"
                            style={{ color: showConfirmPassword ? '#10B981' : 'var(--text-secondary)' }}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    }
                />

                {/* Submit */}
                <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest text-white relative overflow-hidden"
                    style={{
                        background: isLoading ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg, #10B981, #22C55E)',
                        boxShadow: isLoading ? 'none' : '0 8px 28px rgba(16,185,129,0.4)',
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                    {!isLoading && (
                        <motion.div
                            className="absolute inset-0"
                            style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)', backgroundSize: '200% 100%' }}
                            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                        />
                    )}
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-3">
                            <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                            Creating Account...
                        </div>
                    ) : (
                        <span className="relative z-10 flex items-center justify-center gap-2"><Zap size={16} /> Create Account</span>
                    )}
                </motion.button>

                {/* Login Link */}
                <div className="text-center pt-1">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        {isModal ? (
                            <button type="button" onClick={onSwitch} className="font-bold hover:opacity-80 transition-opacity" style={{ color: '#10B981' }}>
                                Sign In →
                            </button>
                        ) : (
                            <Link to="/login" className="font-bold hover:opacity-80 transition-opacity" style={{ color: '#10B981' }}>
                                Sign In →
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

            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div className="absolute rounded-full blur-3xl"
                    style={{ width: 500, height: 500, top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent)' }}
                    animate={{ x: [0, -60, 0], y: [0, 80, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} />
                <motion.div className="absolute rounded-full blur-3xl"
                    style={{ width: 350, height: 350, bottom: '0%', left: '-5%', background: 'radial-gradient(circle, rgba(34,197,94,0.1), transparent)' }}
                    animate={{ x: [0, 70, 0], y: [0, -50, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(var(--navbar-border) 1px, transparent 1px), linear-gradient(90deg, var(--navbar-border) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px', opacity: 0.15
                }} />
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-lg w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="p-8 sm:p-10 rounded-3xl border relative overflow-hidden"
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

export default Register;
