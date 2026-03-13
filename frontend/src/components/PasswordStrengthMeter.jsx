import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PasswordStrengthMeter = ({ password = '' }) => {
    const calculateStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8) strength += 25;
        if (pwd.match(/[A-Z]/)) strength += 25;
        if (pwd.match(/[0-9]/)) strength += 25;
        if (pwd.match(/[^A-Za-z0-9]/)) strength += 25;
        return strength;
    };

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    const strength = calculateStrength(password);

    const getStrengthColor = () => {
        if (!password) return 'rgba(148, 163, 184, 0.3)'; // slate-400
        if (strength <= 25) return 'rgba(248, 113, 113, 0.8)'; // red
        if (strength <= 50) return 'rgba(251, 191, 36, 0.8)'; // amber
        if (strength <= 75) return 'rgba(16, 185, 129, 0.8)'; // emerald
        return 'var(--accent-color)'; // green
    };

    const getStrengthText = () => {
        if (!password) return '';
        if (strength <= 25) return 'Weak';
        if (strength <= 50) return 'Medium';
        if (strength <= 75) return 'Strong';
        return 'Excellent';
    };

    if (!password) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
        >
            <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(148, 163, 184, 0.3)' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${strength}%` }}
                        className="h-full rounded-full transition-all duration-500"
                        style={{ background: getStrengthColor() }}
                    />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: getStrengthColor() }}>
                    {getStrengthText()}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {[
                    { label: '8+ characters', met: isLongEnough },
                    { label: 'Uppercase letter', met: hasUppercase },
                    { label: 'Number', met: hasNumber },
                    { label: 'Special character', met: hasSpecialChar }
                ].map((requirement, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-2 text-xs"
                        style={{ color: requirement.met ? 'var(--accent-color)' : 'var(--text-secondary)' }}
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: requirement.met ? 1 : 0, rotate: requirement.met ? 0 : -180 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: requirement.met ? 'var(--accent-color)' : 'transparent', border: requirement.met ? 'none' : '1.5px solid currentColor' }}
                        >
                            {requirement.met && <Check size={12} className="text-white" />}
                        </motion.div>
                        {requirement.label}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default PasswordStrengthMeter;
