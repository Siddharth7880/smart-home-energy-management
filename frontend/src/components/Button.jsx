import { motion } from 'framer-motion';
import { useState } from 'react';

const variants = {
    primary: "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/30 hover:shadow-green-600/50 hover:-translate-y-0.5",
    secondary: "bg-white text-slate-700 border-2 border-slate-100 hover:border-green-500 hover:text-green-600 shadow-sm hover:-translate-y-0.5",
    outline: "border-2 border-green-600 text-green-700 hover:bg-green-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    accent: "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30",
};

const Button = ({ children, variant = "primary", className = "", isLoading, style: extStyle, ...props }) => {
    const [ripples, setRipples] = useState([]);

    const addRipple = (e) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height);

        const ripple = {
            x: x - size / 2,
            y: y - size / 2,
            size,
            id: Date.now()
        };

        setRipples([ripple]);

        setTimeout(() => {
            setRipples([]);
        }, 600);
    };

    return (
        <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -2 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 rounded-xl font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden
        ${variants[variant]} 
        ${isLoading ? 'opacity-70 cursor-not-allowed grayscale' : 'cursor-pointer'} 
        ${className}`}
            style={{
                ...(variant === 'secondary' ? { background: 'var(--glass-surface)', color: 'var(--text-color)', border: '2px solid var(--border-color)' } : {}),
                ...(variant === 'ghost' ? { background: 'transparent', color: 'var(--text-secondary)' } : {}),
                ...extStyle,
            }}
            disabled={isLoading}
            onClick={(e) => {
                addRipple(e);
                props.onClick?.(e);
            }}
            {...props}
        >
            {/* Ripple effect */}
            {ripples.map(ripple => (
                <motion.span
                    key={ripple.id}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: ripple.size,
                        height: ripple.size,
                        background: 'rgba(255, 255, 255, 0.5)',
                    }}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 0.6, easing: 'easeOut' }}
                />
            ))}

            {/* Loading spinner */}
            {isLoading && (
                <motion.span
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
            )}
            {children}
        </motion.button>
    );
};

export default Button;
