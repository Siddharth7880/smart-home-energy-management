import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Login from '../pages/Login';
import Register from '../pages/Register';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden border"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
            >
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex p-2 m-4 rounded-2xl relative" style={{ background: 'var(--glass-surface)' }}>
                    <div className="absolute inset-2 w-[calc(50%-8px)] rounded-xl shadow-sm transition-all duration-300"
                        style={{ background: 'var(--card-bg)', transform: `translateX(${mode === 'login' ? '0%' : '100%'})` }}
                    />
                    <button
                        className="flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-xl relative z-10 transition-colors"
                        style={{ color: mode === 'login' ? 'var(--text-color)' : 'var(--text-secondary)' }}
                        onClick={() => setMode('login')}
                    >
                        Sign In
                    </button>
                    <button
                        className="flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-xl relative z-10 transition-colors"
                        style={{ color: mode === 'register' ? 'var(--text-color)' : 'var(--text-secondary)' }}
                        onClick={() => setMode('register')}
                    >
                        Create Account
                    </button>
                </div>

                <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="p-1"> {/* Padding for shadow/overflow */}
                        <AnimatePresence mode="wait">
                            {mode === 'login' ? (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* We pass a prop to indicate it's in a modal to adjust styles if needed */}
                                    <Login isModal={true} onSwitch={() => setMode('register')} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="register"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Register isModal={true} onSwitch={() => setMode('login')} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthModal;
