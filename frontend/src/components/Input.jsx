import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

const Input = forwardRef(({ label, error, icon: Icon, className = "", value = "", isValid = false, showValidation = false, tooltip = "", ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Label should stay up if focused OR has value
    const shouldLabelBeUp = isFocused || (value && String(value).length > 0);

    return (
        <div className="flex flex-col gap-1 w-full relative group">
            {label && (
                <motion.label
                    animate={shouldLabelBeUp ? {
                        y: -28,
                        scale: 0.85,
                        color: error ? '#ef4444' : isFocused ? 'var(--accent-color)' : 'var(--text-secondary)'
                    } : {
                        y: 0,
                        scale: 1,
                        color: error ? '#ef4444' : 'var(--label-color)'
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="text-xs font-black tracking-widest uppercase ml-1 origin-left pointer-events-none"
                >
                    {label}
                </motion.label>
            )}

            <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <motion.div
                    className="absolute inset-0 rounded-xl blur-lg opacity-0 pointer-events-none transition-opacity duration-300"
                    animate={{
                        opacity: isFocused ? (error ? 0.3 : 0.4) : 0,
                        background: isFocused ? (error ? 'rgba(239, 68, 68, 0.5)' : 'var(--accent-glow)') : 'transparent'
                    }}
                />

                {Icon && (
                    <motion.div
                        className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none"
                        animate={{ color: isFocused ? 'var(--accent-color)' : error ? '#ef4444' : 'var(--text-secondary)' }}
                    >
                        <Icon size={18} />
                    </motion.div>
                )}

                <input
                    ref={ref}
                    className={`w-full relative z-10 ${Icon ? 'pl-11' : 'px-4'} pr-12 py-3.5 border rounded-xl 
                        focus:ring-0 transition-all duration-300 outline-none 
                        font-medium
                        shadow-sm hover:shadow-md focus:shadow-lg
                        ${error ? 'border-red-500' : isFocused ? 'border-[var(--accent-color)]' : 'border-[var(--input-border)]'}
                        ${className}`}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                    style={{
                        background: 'var(--input-bg)',
                        color: 'var(--text-color)',
                        borderColor: error ? '#ef4444' : isFocused ? 'var(--accent-color)' : 'var(--input-border)',
                        opacity: 1,
                    }}
                />

                {/* Validation Icons */}
                {showValidation && (
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                        {error ? (
                            <motion.div animate={{ shake: 3 }} transition={{ type: 'spring', stiffness: 300 }}>
                                <AlertCircle size={18} className="text-red-500" />
                            </motion.div>
                        ) : isValid ? (
                            <Check size={18} className="text-green-500" />
                        ) : null}
                    </motion.div>
                )}
            </div>

            {/* Tooltip */}
            {tooltip && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: (isHovered && !isFocused) ? 1 : 0, y: (isHovered && !isFocused) ? 0 : -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-12 left-4 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none z-50 shadow-lg"
                    style={{ display: (isHovered && !isFocused) ? 'block' : 'none' }}
                >
                    {tooltip}
                    <div className="absolute bottom-0 left-2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
                </motion.div>
            )}

            {/* Error Message with Animation */}
            {error && (
                <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-medium text-red-500 ml-1 flex items-center gap-1"
                >
                    <span className="w-1 h-1 rounded-full bg-red-500" />
                    {error}
                </motion.span>
            )}
        </div>
    );
});

Input.displayName = "Input";
export default Input;
