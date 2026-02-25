import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, BarChart2, Shield, Smartphone, ArrowRight } from 'lucide-react';
import AuthModal from '../components/AuthModal';

const Home = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    const openAuth = (mode) => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
    };

    return (
        <div className="min-h-screen font-sans transition-colors duration-300" style={{
            background: `linear-gradient(to bottom right, var(--bg-gradient-from), var(--bg-gradient-to))`,
            color: 'var(--text-color)'
        }}>
            {/* Navbar Placeholder (if not in App layout) - Assuming App layout handles Navbar */}

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-green-200/40 to-transparent" />
                        <div className="absolute top-20 right-20 w-96 h-96 bg-green-300/25 rounded-full blur-3xl animate-float" />
                        <div className="absolute bottom-20 left-10 w-72 h-72 bg-emerald-300/25 rounded-full blur-3xl animate-float delay-1000" />
                        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl animate-float delay-500" />
                    </div>

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="lg:w-1/2 space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-xs uppercase tracking-widest"
                                    style={{ background: 'var(--accent-glow)', borderColor: 'var(--accent-glow)', color: 'var(--accent-color)' }}
                                >
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    Smart Energy Management v4.2
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]"
                                    style={{ color: 'var(--text-color)' }}
                                >
                                    Manage Energy <br />
                                    <span className="text-transparent bg-clip-text" style={{
                                        backgroundImage: 'linear-gradient(to right, var(--accent-color), var(--accent-hover))'
                                    }}>
                                        Intelligently
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-lg max-w-xl leading-relaxed font-medium"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    Take control of your home's energy consumption with AI-driven insights, real-time monitoring, and automated optimization.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex flex-col sm:flex-row gap-4"
                                >
                                    <button
                                        onClick={() => openAuth('register')}
                                        className="px-8 py-4 text-white rounded-2xl font-bold text-lg shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
                                        style={{
                                            background: `linear-gradient(to right, var(--accent-color), var(--accent-hover))`,
                                            boxShadow: '0 25px 50px -12px rgba(var(--accent-color-rgb), 0.3)'
                                        }}
                                    >
                                        Get Started
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        className="px-8 py-4 rounded-2xl font-bold text-lg transform hover:-translate-y-1 transition-all duration-300"
                                        style={{
                                            background: 'var(--card-bg)',
                                            color: 'var(--accent-color)',
                                            border: '2px solid var(--border-color)'
                                        }}
                                    >
                                        View Demo
                                    </button>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="pt-8 flex items-center gap-8"
                                    style={{ color: 'var(--accent-color)' }}
                                >
                                    {/* Partner/Integrations Logos Placeholder */}
                                    <div className="h-8 font-black text-xl flex items-center gap-2" style={{ color: 'var(--accent-color)' }}><Zap size={24} /> POWERGRID</div>
                                    <div className="h-8 font-black text-xl flex items-center gap-2" style={{ color: 'var(--accent-color)' }}><Shield size={24} /> SECUREHOME</div>
                                </motion.div>
                            </div>

                            <div className="lg:w-1/2 relative">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="relative z-10"
                                >
                                    {/* Abstract 3D-like Composition built with Tailwind/CSS */}
                                    <div className="relative w-full aspect-square max-w-[600px] mx-auto">
                                        {/* Main Card */}
                                        <div className="absolute inset-10 rounded-[3rem] shadow-2xl p-8 flex flex-col justify-between z-20" style={{
                                            background: 'var(--card-bg)',
                                            border: '1px solid var(--border-color)',
                                            boxShadow: 'var(--card-shadow)'
                                        }}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Total Savings</div>
                                                    <div className="text-4xl font-black mt-1" style={{ color: 'var(--text-color)' }}>$1,245.00</div>
                                                </div>
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{
                                                    background: 'var(--accent-bg)',
                                                    color: 'var(--accent-color)'
                                                }}>
                                                    <BarChart2 size={24} />
                                                </div>
                                            </div>

                                            <div className="h-32 flex items-end gap-2 my-8">
                                                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                                    <div key={i} className="flex-1 rounded-lg relative overflow-hidden group" style={{ background: 'var(--accent-bg)' }}>
                                                        <div
                                                            className="absolute bottom-0 left-0 w-full transition-all duration-1000"
                                                            style={{
                                                                height: `${h}%`,
                                                                background: `linear-gradient(to top, var(--accent-color), var(--accent-hover))`
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="flex-1 p-4 rounded-2xl flex items-center gap-3" style={{ background: 'var(--accent-bg)' }}>
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{
                                                        background: 'var(--card-bg)',
                                                        color: 'var(--accent-color)'
                                                    }}>
                                                        <Zap size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Usage</div>
                                                        <div className="text-sm font-black" style={{ color: 'var(--text-color)' }}>245 kWh</div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 p-4 rounded-2xl flex items-center gap-3" style={{ background: 'var(--accent-bg)' }}>
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{
                                                        background: 'var(--card-bg)',
                                                        color: 'var(--accent-color)'
                                                    }}>
                                                        <Smartphone size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Devices</div>
                                                        <div className="text-sm font-black" style={{ color: 'var(--text-color)' }}>12 Active</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Floating Elements */}
                                        <motion.div
                                            animate={{ y: [0, -20, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute -top-4 -right-4 w-48 p-4 rounded-2xl shadow-lg z-30"
                                            style={{
                                                background: 'var(--card-bg)',
                                                border: '1px solid var(--border-color)',
                                                boxShadow: 'var(--card-shadow)'
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                                                    background: 'var(--accent-bg)',
                                                    color: 'var(--accent-color)'
                                                }}>
                                                    <Shield size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold" style={{ color: 'var(--text-color)' }}>System Secure</div>
                                                    <div className="text-[10px] font-medium" style={{ color: 'var(--accent-color)' }}>No threats detected</div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            animate={{ y: [0, 20, 0] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                            className="absolute -bottom-8 -left-8 w-56 p-4 rounded-2xl shadow-lg z-30"
                                            style={{
                                                background: 'var(--card-bg)',
                                                border: '1px solid var(--border-color)',
                                                boxShadow: 'var(--card-shadow)'
                                            }}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Efficiency</span>
                                                <span className="text-xs font-black" style={{ color: 'var(--accent-color)' }}>98%</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--accent-bg)' }}>
                                                <div className="w-[98%] h-full" style={{
                                                    background: 'linear-gradient(to right, var(--accent-color), var(--accent-hover))'
                                                }} />
                                            </div>
                                        </motion.div>

                                        {/* Decorative Circle */}
                                        <div className="absolute inset-0 border border-dashed rounded-full animate-spin-slow -z-10" style={{
                                            borderColor: 'var(--border-color)'
                                        }} />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid (Quick Preview) */}
                <section className="py-20" style={{
                    background: `linear-gradient(to bottom, var(--bg-gradient-from), var(--bg-gradient-to))`
                }}>
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Real-time Monitoring", icon: <BarChart2 className="w-6 h-6" style={{ color: 'var(--accent-color)' }} />, desc: "Track energy usage as it happens with millisecond precision." },
                                { title: "Smart Automation", icon: <Smartphone className="w-6 h-6" style={{ color: 'var(--accent-color)' }} />, desc: "Control devices automatically based on your habits and rates." },
                                { title: "Cost Prediction", icon: <Zap className="w-6 h-6" style={{ color: 'var(--accent-color)' }} />, desc: "AI algorithms predict your bill before it arrives." }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="p-8 rounded-3xl shadow-md hover:shadow-lg transition-all"
                                    style={{
                                        background: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)',
                                        boxShadow: 'var(--card-shadow)'
                                    }}
                                >
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{
                                        background: 'var(--accent-bg)'
                                    }}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>{feature.title}</h3>
                                    <p className="leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />
        </div>
    );
};

export default Home;
