import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, Menu, X, LogOut, User, Sun, Moon, ChevronRight, Settings, Wrench, Home, BarChart2, Crown, Clock, Bell, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { alertApi } from '../services/api';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [unreadAlerts, setUnreadAlerts] = useState(0);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationRef = useRef(null);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close drawer on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Poll for alerts every 30 s
    const fetchAlertCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const res = await alertApi.getAlerts();
            setUnreadAlerts(res.data?.unreadCount ?? 0);
            setAlerts(res.data?.alerts || []);
        } catch { /* silent */ }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchAlertCount();
        const id = setInterval(fetchAlertCount, 30000);
        return () => clearInterval(id);
    }, [fetchAlertCount]);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await alertApi.markAllRead();
            fetchAlertCount();
        } catch { /* silent */ }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    const getRoleBadge = () => {
        if (user?.roles?.includes('ROLE_ADMIN')) return { label: 'Admin', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };
        if (user?.roles?.includes('ROLE_TECHNICIAN')) return { label: 'Tech', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' };
        return { label: 'Owner', color: '#10B981', bg: 'rgba(16,185,129,0.1)' };
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: Home, roles: null },
        { path: '/admin', label: 'Admin', icon: Crown, roles: ['ROLE_ADMIN'] },
        { path: '/devices', label: 'Devices', icon: Settings, roles: ['ROLE_HOMEOWNER', 'ROLE_ADMIN'] },
        { path: '/automation', label: 'Automation', icon: Clock, roles: ['ROLE_HOMEOWNER', 'ROLE_ADMIN'] },
        { path: '/technician', label: 'Technician', icon: Wrench, roles: ['ROLE_TECHNICIAN', 'ROLE_ADMIN'] },
    ];

    const visibleLinks = navLinks.filter(link =>
        !link.roles || link.roles.some(r => user?.roles?.includes(r))
    );

    const NavLink = ({ path, label, icon: Icon }) => {
        const active = isActive(path);
        return (
            <Link to={path} className="relative group flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all duration-300"
                style={{
                    color: active ? '#10B981' : 'var(--text-secondary)',
                    background: active ? 'rgba(16,185,129,0.1)' : 'transparent',
                }}>
                <Icon size={15} />
                {label}
                {/* Active underline */}
                <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                    style={{ background: '#10B981' }}
                    initial={false}
                    animate={{ width: active ? '60%' : '0%' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                />
                {/* Hover underline */}
                {!active && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full w-0 group-hover:w-[50%] transition-all duration-300"
                        style={{ background: 'rgba(16,185,129,0.5)' }} />
                )}
            </Link>
        );
    };

    const badge = isAuthenticated ? getRoleBadge() : null;

    return (
        <>
            <motion.nav
                initial={{ y: -64, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="sticky top-0 z-50 transition-all duration-300"
                style={{
                    background: scrolled
                        ? (theme === 'dark' ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)')
                        : (theme === 'dark' ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.6)'),
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${scrolled ? 'var(--navbar-border)' : 'rgba(16,185,129,0.08)'}`,
                    boxShadow: scrolled ? (theme === 'dark' ? '0 4px 32px rgba(0,0,0,0.4)' : '0 4px 32px rgba(16,185,129,0.1)') : 'none',
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <motion.div
                                className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: 'linear-gradient(135deg, #10B981, #22C55E)',
                                    boxShadow: '0 0 16px rgba(16,185,129,0.4)',
                                }}
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Zap className="h-5 w-5 text-white" />
                            </motion.div>
                            <span className="font-black text-lg tracking-tight hidden sm:inline"
                                style={{ color: '#10B981' }}>
                                ECOSMART
                            </span>
                        </Link>

                        {/* Desktop Center Links */}
                        {isAuthenticated && (
                            <div className="hidden md:flex items-center gap-1">
                                {visibleLinks.map(link => (
                                    <NavLink key={link.path} {...link} />
                                ))}
                            </div>
                        )}

                        {/* Desktop Right */}
                        <div className="hidden md:flex items-center gap-3">
                            {/* Theme Toggle */}
                             <motion.button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg transition-all"
                                style={{
                                    background: 'rgba(16,185,129,0.08)',
                                    color: '#10B981',
                                }}
                                whileHover={{ scale: 1.1, background: 'rgba(16,185,129,0.15)' }}
                                whileTap={{ scale: 0.9 }}
                                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                    </motion.div>
                                </AnimatePresence>
                            </motion.button>

                            {/* Alert Bell Dropdown */}
                            {isAuthenticated && (
                                <div className="relative" ref={notificationRef}>
                                    <button 
                                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                        className="relative p-2 rounded-lg transition-all z-20"
                                        style={{ background: isNotificationsOpen ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)', color: '#10B981', border: 'none', cursor: 'pointer' }}
                                        title="Energy Alerts">
                                        <Bell className="h-4 w-4" />
                                        {unreadAlerts > 0 && (
                                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-white text-xs font-black flex items-center justify-center"
                                                style={{ background: '#EF4444', fontSize: '9px' }}>
                                                {unreadAlerts > 9 ? '9+' : unreadAlerts}
                                            </span>
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isNotificationsOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border overflow-hidden z-[100]"
                                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', backdropFilter: 'blur(16px)' }}
                                            >
                                                <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                                                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>Notifications</h3>
                                                    {unreadAlerts > 0 && (
                                                        <button onClick={handleMarkAllRead} className="text-xs font-semibold hover:underline" style={{ color: '#10B981', cursor: 'pointer', background: 'none', border: 'none' }}>
                                                            Mark all as read
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="max-h-80 overflow-y-auto">
                                                    {alerts.length === 0 ? (
                                                        <div className="p-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                            No notifications right now.
                                                        </div>
                                                    ) : (
                                                        alerts.map((alert) => (
                                                            <div key={alert.id} className="p-4 border-b hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border-color)', background: alert.read ? 'transparent' : 'rgba(239, 68, 68, 0.04)' }}>
                                                                <div className="flex gap-3 items-start">
                                                                    <div className={`mt-0.5 p-1.5 rounded-full ${alert.type === 'OVERLOAD' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                                                                        {alert.type === 'OVERLOAD' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-color)' }}>
                                                                            {alert.type === 'OVERLOAD' ? 'Energy Overload Detected' : 'System Update'}
                                                                        </p>
                                                                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                                            {alert.message}
                                                                        </p>
                                                                        <p className="text-[10px] mt-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                                            {new Date(alert.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                <div className="p-3 border-t text-center" style={{ borderColor: 'var(--border-color)', background: 'rgba(0,0,0,0.02)' }}>
                                                    <Link to="/dashboard" onClick={() => setIsNotificationsOpen(false)} className="text-xs font-bold hover:underline" style={{ color: '#10B981' }}>
                                                        Go to Dashboard
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {isAuthenticated ? (
                                <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: 'var(--navbar-border)' }}>
                                    {/* User avatar + role badge */}
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full border-2 flex items-center justify-center font-black text-sm"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(34,197,94,0.1))',
                                                borderColor: 'rgba(16,185,129,0.4)',
                                                color: '#10B981',
                                            }}>
                                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="hidden lg:block">
                                            <div className="text-xs font-bold" style={{ color: 'var(--text-color)' }}>
                                                {user?.username || 'User'}
                                            </div>
                                            <div className="text-xs font-semibold px-1.5 rounded-full w-fit"
                                                style={{ background: badge?.bg, color: badge?.color }}>
                                                {badge?.label}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logout */}
                                    <motion.button
                                        onClick={handleLogout}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                                        style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}
                                        whileHover={{ scale: 1.05, background: 'rgba(239,68,68,0.15)' }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        Logout
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login"
                                        className="px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all"
                                        style={{ color: '#10B981' }}>
                                        Login
                                    </Link>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link to="/register"
                                            className="px-5 py-2 rounded-xl text-sm font-bold tracking-wide text-white transition-all"
                                            style={{
                                                background: 'linear-gradient(135deg, #10B981, #22C55E)',
                                                boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
                                            }}>
                                            Register
                                        </Link>
                                    </motion.div>
                                </div>
                            )}
                        </div>

                        {/* Mobile right */}
                        <div className="flex items-center md:hidden gap-2">
                            <motion.button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg"
                                style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981' }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </motion.button>
                            <motion.button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 rounded-lg"
                                style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981' }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div key={isOpen ? 'x' : 'menu'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                    </motion.div>
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Drawer Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-40 md:hidden"
                            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Slide-in Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-72 z-50 md:hidden flex flex-col"
                            style={{
                                background: 'var(--card-bg)',
                                backdropFilter: 'blur(24px)',
                                borderLeft: '1px solid var(--navbar-border)',
                                boxShadow: theme === 'dark' ? '-16px 0 48px rgba(0,0,0,0.6)' : '-16px 0 48px rgba(16,185,129,0.08)',
                            }}
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b"
                                style={{ borderColor: 'rgba(16,185,129,0.12)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                                        style={{ background: 'linear-gradient(135deg, #10B981, #22C55E)', boxShadow: '0 0 12px rgba(16,185,129,0.4)' }}>
                                        <Zap className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="font-black text-base" style={{ color: '#10B981' }}>ECOSMART</span>
                                </div>
                                <motion.button onClick={() => setIsOpen(false)} whileTap={{ scale: 0.9 }}
                                    className="p-1.5 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
                                    <X size={18} />
                                </motion.button>
                            </div>

                            {/* User Info (if authenticated) */}
                            {isAuthenticated && (
                                <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(16,185,129,0.08)' }}>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl"
                                        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)' }}>
                                        <div className="h-10 w-10 rounded-full border-2 flex items-center justify-center font-black"
                                            style={{ borderColor: 'rgba(16,185,129,0.4)', color: '#10B981', background: 'rgba(16,185,129,0.1)' }}>
                                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>{user?.username}</p>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                                style={{ background: badge?.bg, color: badge?.color }}>
                                                {badge?.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Nav Links */}
                            <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                                {isAuthenticated ? (
                                    visibleLinks.map((link, i) => {
                                        const active = isActive(link.path);
                                        const LinkIcon = link.icon;
                                        return (
                                            <motion.div
                                                key={link.path}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                            >
                                                <Link
                                                    to={link.path}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all"
                                                    style={{
                                                        background: active ? 'rgba(16,185,129,0.1)' : 'transparent',
                                                        color: active ? '#10B981' : 'var(--text-secondary)',
                                                        border: `1px solid ${active ? 'rgba(16,185,129,0.2)' : 'transparent'}`,
                                                    }}
                                                >
                                                    <LinkIcon size={16} />
                                                    {link.label}
                                                    {active && <ChevronRight size={14} className="ml-auto" style={{ color: '#10B981' }} />}
                                                </Link>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm"
                                            style={{ color: '#10B981' }}>
                                            <User size={16} /> Login
                                        </Link>
                                        <Link to="/register" onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-white"
                                            style={{ background: 'linear-gradient(135deg, #10B981, #22C55E)' }}>
                                            <Zap size={16} /> Register
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Drawer Footer */}
                            {isAuthenticated && (
                                <div className="px-4 py-5 border-t" style={{ borderColor: 'rgba(16,185,129,0.1)' }}>
                                    <motion.button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all"
                                        style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}
                                        whileHover={{ background: 'rgba(239,68,68,0.15)' }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </motion.button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
