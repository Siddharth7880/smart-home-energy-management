import { motion } from 'framer-motion';

// Pre-generate particles outside component to avoid render purity issues
const generateParticles = () => {
    return Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        delay: Math.random() * 2,
        duration: 20 + Math.random() * 10,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 30 + 10,
    }));
};

const particles = generateParticles();

const AnimatedBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden z-0">
            {/* Gradient Background */}
            <div className="absolute inset-0" style={{
                background: `linear-gradient(to bottom right, var(--bg-gradient-from), var(--bg-gradient-to))`
            }} />

            {/* Animated soft blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <motion.div
                    className="absolute rounded-full blur-3xl"
                    style={{
                        background: 'var(--accent-color)',
                        opacity: 0.08,
                        width: '400px',
                        height: '400px',
                        top: '10%',
                        left: '5%'
                    }}
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute rounded-full blur-3xl"
                    style={{
                        background: 'var(--accent-hover)',
                        opacity: 0.08,
                        width: '500px',
                        height: '500px',
                        bottom: '10%',
                        right: '5%'
                    }}
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 2,
                    }}
                />
                <motion.div
                    className="absolute rounded-full blur-3xl"
                    style={{
                        background: 'var(--accent-color)',
                        opacity: 0.05,
                        width: '600px',
                        height: '600px',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                    animate={{
                        x: [0, 60, -60, 0],
                        y: [0, 80, -60, 0],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </div>

            {/* Floating energy particles */}
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full"
                    initial={{
                        x: `${particle.x}%`,
                        y: `${particle.y}%`,
                        opacity: 0,
                    }}
                    animate={{
                        y: [
                            `${particle.y}%`,
                            `${particle.y - 100}%`,
                        ],
                        opacity: [
                            0,
                            0.6,
                            0.6,
                            0,
                        ],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: particle.delay,
                    }}
                    style={{
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        background: `radial-gradient(circle, var(--accent-color), transparent)`,
                        filter: 'blur(1px)',
                        boxShadow: '0 0 20px var(--accent-glow)',
                    }}
                />
            ))}

            {/* Animated energy lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ opacity: 0.1 }}>
                <defs>
                    <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#16a34a" />
                        <stop offset="100%" stopColor="#15803d" />
                    </linearGradient>
                </defs>
                <path
                    d="M0,50 Q250,0 500,50 T1000,50"
                    stroke="url(#energyGradient)"
                    strokeWidth="2"
                    fill="none"
                    style={{ opacity: 0.3 }}
                />
                <circle
                    cx="50"
                    cy="50"
                    r="8"
                    fill="#16a34a"
                />
            </svg>
        </div>
    );
};

export default AnimatedBackground;
