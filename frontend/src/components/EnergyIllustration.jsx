import { motion } from 'framer-motion';
import { Zap, Sun, Lightbulb, Smartphone } from 'lucide-react';

const EnergyIllustration = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex flex-col items-center justify-center w-full max-w-xs"
        >
            {/* Main solar panel / energy circle */}
            <motion.div
                className="relative w-48 h-48 mb-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
                <svg viewBox="0 0 200 200" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.3))' }}>
                    {/* Outer circle */}
                    <motion.circle
                        cx="100"
                        cy="100"
                        r="95"
                        fill="none"
                        stroke="var(--accent-color)"
                        strokeWidth="1"
                        opacity="0.3"
                    />
                    {/* Solar panel lines */}
                    {Array.from({ length: 6 }).map((_, i) => (
                        <motion.line
                            key={i}
                            x1="100"
                            y1="100"
                            x2={100 + 80 * Math.cos((i * Math.PI) / 3)}
                            y2={100 + 80 * Math.sin((i * Math.PI) / 3)}
                            stroke="var(--accent-color)"
                            strokeWidth="2"
                            opacity="0.4"
                        />
                    ))}
                    {/* Center glow */}
                    <circle
                        cx="100"
                        cy="100"
                        r="20"
                        fill="var(--accent-color)"
                        opacity="0.2"
                    />
                </svg>

                {/* Sun icon in center */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <Sun size={60} className="text-green-500" style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))' }} />
                </motion.div>
            </motion.div>

            {/* Floating icons around the circle */}
            {[
                { Icon: Zap, angle: 0, label: 'Power' },
                { Icon: Lightbulb, angle: Math.PI * 0.67, label: 'Efficiency' },
                { Icon: Smartphone, angle: Math.PI * 1.33, label: 'Smart' },
            ].map((item, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    animate={{
                        x: [0, Math.cos(item.angle + i * 0.5) * 20, 0],
                        y: [0, Math.sin(item.angle + i * 0.5) * 20, 0],
                    }}
                    transition={{
                        duration: 4 + i,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={({
                        top: `calc(50% + ${120 * Math.sin(item.angle)}px)`,
                        left: `calc(50% + ${120 * Math.cos(item.angle)}px)`,
                        transform: 'translate(-50%, -50%)',
                    })}
                >
                    <motion.div
                        className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-full text-white shadow-lg"
                        whileHover={{ scale: 1.2 }}
                        style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                    >
                        <item.Icon size={24} />
                    </motion.div>
                </motion.div>
            ))}

            {/* Energy pulse lines */}
            <motion.svg
                className="absolute w-72 h-72 -z-10"
                viewBox="0 0 400 400"
                style={{ opacity: 0.2 }}
            >
                {Array.from({ length: 3 }).map((_, i) => (
                    <motion.circle
                        key={i}
                        cx="200"
                        cy="200"
                        r={100 + i * 50}
                        fill="none"
                        stroke="var(--accent-color)"
                        strokeWidth="2"
                        animate={{
                            strokeDasharray: 628,
                            strokeDashoffset: [628, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                        }}
                    />
                ))}
            </motion.svg>
        </motion.div>
    );
};

export default EnergyIllustration;
