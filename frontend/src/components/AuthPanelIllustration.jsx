import { motion } from 'framer-motion';
import { Zap, Lightbulb, TrendingDown, Clock, Users } from 'lucide-react';

const AuthPanelIllustration = () => {
    const stats = [
        { icon: TrendingDown, label: 'Energy Saved', value: '50%', color: '#16a34a' },
        { icon: Clock, label: 'Monitoring', value: '24/7', color: '#10b981' },
        { icon: Users, label: 'Users', value: '100+', color: '#059669' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:flex flex-col items-center justify-between h-full w-full max-w-sm py-12"
        >
            {/* Top Section - Title & Subtitle */}
            <motion.div
                className="text-center space-y-4 w-full"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                <motion.h1
                    className="text-4xl font-black tracking-tight"
                    style={{ color: 'var(--text-color)' }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    Smart Energy
                    <br />
                    <span style={{ color: 'var(--accent-color)' }}>Management</span>
                </motion.h1>
                <motion.p
                    className="text-sm font-medium leading-relaxed"
                    style={{ color: 'var(--text-secondary)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    Control your home's energy usage in real-time. Monitor consumption, reduce bills, and contribute to a sustainable future.
                </motion.p>
            </motion.div>

            {/* Middle Section - Large Energy Icon Block with Floating Tiles */}
            <motion.div
                className="relative w-full flex flex-col items-center justify-center my-12"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
            >
                {/* Large Energy Icon Block */}
                <motion.div
                    className="relative w-56 h-56 rounded-3xl flex items-center justify-center mb-8 shadow-2xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.15), rgba(16, 185, 129, 0.1))',
                        border: '2px solid rgba(22, 163, 74, 0.3)',
                        backdropFilter: 'blur(10px)',
                    }}
                    whileHover={{ scale: 1.05 }}
                >
                    {/* Animated background glow */}
                    <motion.div
                        className="absolute inset-0 rounded-3xl"
                        animate={{
                            boxShadow: [
                                '0 0 30px rgba(22, 163, 74, 0.3)',
                                '0 0 50px rgba(22, 163, 74, 0.5)',
                                '0 0 30px rgba(22, 163, 74, 0.3)',
                            ],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />

                    {/* Central Zap Icon */}
                    <motion.div
                        className="relative z-10"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    >
                        <Zap size={100} className="text-green-500" style={{ filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.6))' }} />
                    </motion.div>

                    {/* Orbiting circles */}
                    <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 10px rgba(22, 163, 74, 0.3))' }}>
                        <motion.circle
                            cx="50%"
                            cy="50%"
                            r="90"
                            fill="none"
                            stroke="rgba(22, 163, 74, 0.2)"
                            strokeWidth="2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            style={{ transformOrigin: '50% 50%' }}
                        />
                        <motion.circle
                            cx="50%"
                            cy="50%"
                            r="110"
                            fill="none"
                            stroke="rgba(22, 163, 74, 0.15)"
                            strokeWidth="1.5"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                            style={{ transformOrigin: '50% 50%' }}
                        />
                    </svg>
                </motion.div>

                {/* Floating Energy Tiles */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Floating Tile 1 - Top Left */}
                    <motion.div
                        className="absolute w-32 h-32 rounded-2xl flex flex-col items-center justify-center shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
                            border: '1.5px solid rgba(16, 185, 129, 0.4)',
                            backdropFilter: 'blur(8px)',
                            top: '-10px',
                            left: '-30px',
                        }}
                        animate={{
                            y: [0, -15, 0],
                            x: [0, -10, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        whileHover={{ scale: 1.08 }}
                    >
                        <Lightbulb size={40} className="text-emerald-500 mb-2" />
                        <span className="text-xs font-bold text-center uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
                            Smart Living
                        </span>
                    </motion.div>

                    {/* Floating Tile 2 - Bottom Right */}
                    <motion.div
                        className="absolute w-32 h-32 rounded-2xl flex flex-col items-center justify-center shadow-lg"
                        style={{
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.15))',
                            border: '1.5px solid rgba(34, 197, 94, 0.4)',
                            backdropFilter: 'blur(8px)',
                            bottom: '-20px',
                            right: '-40px',
                        }}
                        animate={{
                            y: [0, 15, 0],
                            x: [0, 10, 0],
                        }}
                        transition={{
                            duration: 4.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.3,
                        }}
                        whileHover={{ scale: 1.08 }}
                    >
                        <TrendingDown size={40} className="text-green-500 mb-2" />
                        <span className="text-xs font-bold text-center uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
                            Reduced Costs
                        </span>
                    </motion.div>
                </div>
            </motion.div>

            {/* Bottom Section - Stats Cards */}
            <div className="w-full grid grid-cols-3 gap-3">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={idx}
                            className="rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-shadow"
                            style={{
                                background: `linear-gradient(135deg, rgba(${stat.color === '#16a34a' ? '22, 163, 74' : stat.color === '#10b981' ? '16, 185, 129' : '5, 150, 105'}, 0.15), rgba(${stat.color === '#16a34a' ? '22, 163, 74' : stat.color === '#10b981' ? '16, 185, 129' : '5, 150, 105'}, 0.08))`,
                                border: `1.5px solid rgba(${stat.color === '#16a34a' ? '22, 163, 74' : stat.color === '#10b981' ? '16, 185, 129' : '5, 150, 105'}, 0.3)`,
                                backdropFilter: 'blur(8px)',
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.3 }}
                                className="mb-2"
                            >
                                <Icon size={24} style={{ color: stat.color }} />
                            </motion.div>
                            <motion.h3
                                className="text-2xl font-black tracking-tight"
                                style={{ color: stat.color }}
                            >
                                {stat.value}
                            </motion.h3>
                            <p className="text-xs font-medium uppercase tracking-wider mt-1" style={{ color: 'var(--text-secondary)' }}>
                                {stat.label}
                            </p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Decorative bottom accent line */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
                style={{
                    background: 'linear-gradient(90deg, transparent, var(--accent-color), transparent)',
                }}
                animate={{
                    opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                }}
            />
        </motion.div>
    );
};

export default AuthPanelIllustration;
