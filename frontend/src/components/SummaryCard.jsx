import { motion } from 'framer-motion';

const SummaryCard = ({ label, value, unit, sub, icon: Icon, color, glow, gradFrom, gradTo, index = 0 }) => {
    return (
        <motion.div
            custom={index}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="rounded-2xl border p-5 relative overflow-hidden cursor-default group"
            style={{
                background: 'var(--glass-surface)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderColor: 'var(--glass-border)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
        >
            {/* Accent top line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(circle at top left, ${glow}, transparent 60%)` }} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl"
                        style={{
                            background: `linear-gradient(135deg, ${gradFrom}22, ${gradTo}11)`,
                            border: `1px solid ${color}33`,
                        }}>
                        <Icon size={22} style={{ color }} />
                    </div>
                </div>

                <p className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: 'var(--text-secondary)' }}>
                    {label}
                </p>

                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black" style={{ color: 'var(--text-color)' }}>
                        {value}
                    </span>
                    {unit && (
                        <span className="text-base font-bold" style={{ color }}>{unit}</span>
                    )}
                </div>

                {sub && (
                    <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
                )}
            </div>
        </motion.div>
    );
};

export default SummaryCard;
