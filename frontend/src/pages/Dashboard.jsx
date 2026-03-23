import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deviceApi, alertApi, insightApi } from '../services/api';
import AddDeviceModal from '../components/AddDeviceModal';
import SummaryCard from '../components/SummaryCard';
import { HourlyUsageChart, DailyUsageChart, LiveUsageBanner } from '../components/EnergyCharts';
import {
    Zap, DollarSign, TrendingUp, Activity, Wind, Lightbulb,
    Shield, Smartphone, Battery, Sun, Leaf, Clock, Flame,
    Droplets, Plus, Loader, AlertCircle, Thermometer, Plug,
    Lock, Droplet, Edit2, Trash2, ToggleLeft, ToggleRight, Cpu, Settings
} from 'lucide-react';
import {
    ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip
} from 'recharts';

// (Static mock data removed — replaced with live API-driven charts)
const mockDeviceData = [
    { name: 'HVAC', value: 45, color: '#10b981' },
    { name: 'Lights', value: 15, color: '#f59e0b' },
    { name: 'Kitchen', value: 25, color: '#3b82f6' },
    { name: 'Other', value: 15, color: '#64748b' },
];

// ── Device icon map ────────────────────────────────────────────────────────────
const deviceIcons = {
    thermostat: Thermometer, bulb: Lightbulb, plug: Plug, lock: Lock,
    air_conditioner: Wind, water_heater: Droplet, solar_panel: Sun,
    ev_charger: Zap, smart_meter: Activity, lighting: Lightbulb,
    speaker: Smartphone, camera: Shield, heater: Flame, washer: Droplets,
    dryer: Wind, refrigerator: Cpu, default: Plug,
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const GlassCard = ({ children, className = '', style = {}, ...props }) => (
    <div className={`rounded-2xl border relative overflow-hidden ${className}`}
        style={{
            background: 'var(--glass-surface)', backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)', borderColor: 'var(--glass-border)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
            transition: 'background 0.3s ease, border-color 0.3s ease', ...style
        }} {...props}>
        <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--accent-glow), transparent)' }} />
        {children}
    </div>
);

const CircularProgress = ({ value, size = 120, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--navbar-border)" strokeWidth={strokeWidth} />
            <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none"
                stroke="url(#scoreGrad)" strokeWidth={strokeWidth} strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: 'easeOut' }} />
            <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
            </defs>
        </svg>
    );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Real device state
    const [devices, setDevices] = useState([]);
    const [loadingDevices, setLoadingDevices] = useState(true);
    const [deviceError, setDeviceError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddingDevice, setIsAddingDevice] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    // Role helpers
    const roles = user?.roles || [];
    const isHomeowner = roles.some(r => r === 'ROLE_HOMEOWNER' || r === 'HOMEOWNER');
    const isAdmin = roles.some(r => r === 'ROLE_ADMIN' || r === 'ADMIN');
    const canEdit = isHomeowner || isAdmin;

    // Clock
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    // Fetch devices
    const fetchDevices = useCallback(async () => {
        try {
            setLoadingDevices(true);
            setDeviceError('');
            const res = await deviceApi.getDevices();
            setDevices(res.data.devices || res.data || []);
        } catch (err) {
            if (err.response?.status === 401) { logout(); navigate('/login'); }
            else setDeviceError(err.response?.data?.message || 'Failed to load devices');
        } finally {
            setLoadingDevices(false);
        }
    }, [logout, navigate]);

    useEffect(() => { fetchDevices(); }, [fetchDevices]);

    // Handlers
    const handleAddDevice = async (formData) => {
        try {
            setIsAddingDevice(true);
            const res = await deviceApi.createDevice(formData);
            setDevices(prev => [...prev, res.data]);
            setIsModalOpen(false);
        } catch (err) {
            setDeviceError(err.response?.data?.message || 'Failed to add device');
        } finally {
            setIsAddingDevice(false);
        }
    };

    const handleDelete = async (deviceId) => {
        if (!window.confirm('Delete this device?')) return;
        try {
            setDeletingId(deviceId);
            await deviceApi.deleteDevice(deviceId);
            setDevices(prev => prev.filter(d => d.id !== deviceId));
        } catch (err) {
            setDeviceError(err.response?.data?.message || 'Failed to delete device');
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggle = async (device) => {
        try {
            setTogglingId(device.id);
            const res = await deviceApi.toggleDevice(device.id);
            setDevices(prev => prev.map(d =>
                d.id === device.id ? res.data : d
            ));
        } catch (err) {
            setDeviceError(err.response?.data?.message || 'Failed to toggle device');
        } finally {
            setTogglingId(null);
        }
    };

    // ── Alert & Threshold state (Milestone 5) ─────────────────────────────────
    const [alerts, setAlerts] = useState([]);        // { id, message, type, read, createdAt }
    const [unreadCount, setUnreadCount] = useState(0);
    const [threshold, setThreshold] = useState(null);  // { thresholdKwh, emailNotification, configured }
    const [thresholdInput, setThresholdInput] = useState('');
    const [savingThreshold, setSavingThreshold] = useState(false);
    const [showAlertBanner, setShowAlertBanner] = useState(true);

    // ── Insights state (Milestone 5) ──────────────────────────────────────────
    const [insights, setInsights] = useState(null);  // { tips, peakHour, offPeakHour, breakdown }
    const [loadingInsights, setLoadingInsights] = useState(false);

    const fetchAlerts = useCallback(async () => {
        try {
            const res = await alertApi.getAlerts();
            setAlerts(res.data?.alerts || []);
            setUnreadCount(res.data?.unreadCount || 0);
        } catch { /* silent */ }
    }, []);

    const fetchThreshold = useCallback(async () => {
        try {
            const res = await alertApi.getThreshold();
            setThreshold(res.data);
            setThresholdInput(res.data?.thresholdKwh ?? 10);
        } catch { /* silent */ }
    }, []);

    const fetchInsights = useCallback(async () => {
        try {
            setLoadingInsights(true);
            const res = await insightApi.getInsights();
            setInsights(res.data);
        } catch { /* silent */ } finally {
            setLoadingInsights(false);
        }
    }, []);

    useEffect(() => {
        fetchAlerts();
        fetchThreshold();
        fetchInsights();
        const id = setInterval(fetchAlerts, 60000); // re-poll every 60s
        return () => clearInterval(id);
    }, [fetchAlerts, fetchThreshold, fetchInsights]);

    const handleMarkRead = async () => {
        try {
            await alertApi.markAllRead();
            setUnreadCount(0);
            setAlerts(prev => prev.map(a => ({ ...a, read: true })));
            setShowAlertBanner(false);
        } catch { /* silent */ }
    };

    const handleSaveThreshold = async () => {
        const val = parseFloat(thresholdInput);
        if (!val || val <= 0) return;
        try {
            setSavingThreshold(true);
            const res = await alertApi.setThreshold(val, threshold?.emailNotification ?? true);
            setThreshold(prev => ({ ...prev, thresholdKwh: res.data.thresholdKwh }));
        } catch { /* silent */ } finally {
            setSavingThreshold(false);
        }
    };

    const overloadAlerts = alerts.filter(a => a.type === 'OVERLOAD' && !a.read);

    // Derived metrics
    const activeCount = devices.filter(d => d.isOnline === true).length;
    const totalPower = devices.reduce((sum, d) => sum + (d.powerRating || 0), 0);

    const summaryCards = [
        {
            label: 'Total Devices', value: devices.length, unit: '', sub: 'Registered in your home',
            icon: Smartphone, color: '#A78BFA', glow: 'rgba(167,139,250,0.25)',
            gradFrom: '#A78BFA', gradTo: '#F472B6',
        },
        {
            label: 'Active Now', value: activeCount, unit: '', sub: `${devices.length - activeCount} device${devices.length - activeCount !== 1 ? 's' : ''} offline`,
            icon: Activity, color: '#10B981', glow: 'rgba(16,185,129,0.25)',
            gradFrom: '#10B981', gradTo: '#22C55E',
        },
        {
            label: 'Power Capacity', value: totalPower.toFixed(1), unit: 'kW', sub: 'Combined power rating',
            icon: Zap, color: '#F59E0B', glow: 'rgba(245,158,11,0.25)',
            gradFrom: '#F59E0B', gradTo: '#F97316',
        },
        {
            label: "Today's Cost", value: '8.42', unit: '$', sub: 'Projected: $120.00',
            icon: DollarSign, color: '#60A5FA', glow: 'rgba(96,165,250,0.25)',
            gradFrom: '#60A5FA', gradTo: '#818CF8',
        },
    ];

    return (
        <div className="min-h-screen p-4 md:p-8"
            style={{
                background: 'linear-gradient(135deg, var(--page-bg-from) 0%, var(--page-bg-mid) 30%, var(--page-bg-from) 70%, var(--page-bg-to) 100%)',
                color: 'var(--text-color)', transition: 'background 0.4s ease',
            }}>
            {/* Background grid */}
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(16,185,129,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.02) 1px, transparent 1px)`,
                backgroundSize: '60px 60px', zIndex: 0
            }} />

            <div className="max-w-7xl mx-auto space-y-6 relative z-10">
                {/* ── Overload Alert Banner (Milestone 5) ── */}
                {canEdit && overloadAlerts.length > 0 && showAlertBanner && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="relative rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                        style={{
                            background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.06))',
                            borderColor: 'rgba(239,68,68,0.35)'
                        }}>
                        <div className="flex items-center gap-3 flex-1">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
                                style={{ background: 'rgba(239,68,68,0.12)' }}>⚠️</div>
                            <div>
                                <h3 className="font-black text-sm" style={{ color: '#EF4444' }}>Energy Overload Detected!</h3>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                    {overloadAlerts[0]?.message}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button onClick={handleMarkRead}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border"
                                style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#EF4444' }}>
                                Dismiss
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ── Header ── */}
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-1" style={{ color: 'var(--text-color)' }}>
                            Hello, <span style={{ color: '#10B981' }}>{user?.username || 'User'}</span> 👋
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full border"
                                style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
                                <motion.div className="w-2 h-2 rounded-full" style={{ background: '#10B981' }}
                                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                <span className="font-semibold text-xs" style={{ color: '#10B981' }}>🟢 System Online</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                <Clock size={12} />
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                                style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
                                <Leaf size={11} /> Eco Mode Active
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Add Device button — homeowner/admin only */}
                        {canEdit && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #10B981, #22C55E)', boxShadow: '0 4px 20px rgba(16,185,129,0.35)' }}>
                                <Plus size={18} /> Add Device
                            </motion.button>
                        )}
                        {/* Avatar */}
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
                            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(16,185,129,0.15)' }}>
                            <div className="h-10 w-10 rounded-full border-2 flex items-center justify-center font-black text-base"
                                style={{ borderColor: 'rgba(16,185,129,0.5)', color: '#10B981', background: 'rgba(16,185,129,0.1)' }}>
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>{user?.username || 'User'}</p>
                                <p className="text-xs" style={{ color: '#10B981' }}>
                                    {isAdmin ? 'Administrator' : isHomeowner ? 'Homeowner' : 'Technician'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* ── Error banner ── */}
                <AnimatePresence>
                    {deviceError && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-2xl border flex items-center gap-3"
                            style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
                            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                            <span className="text-sm font-semibold text-red-400">{deviceError}</span>
                            <button onClick={() => setDeviceError('')} className="ml-auto text-red-400 text-xs font-bold">✕</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Live Usage Banner (auto-refreshes every 10s) ── */}
                <LiveUsageBanner autoRefreshMs={10000} />

                {/* ── Summary Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {summaryCards.map((card, i) => (
                        <SummaryCard key={card.label} {...card} index={i} />
                    ))}
                </div>

                {/* ── Charts + Sidebar ── */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Charts column */}
                    <div className="xl:col-span-8 space-y-6">
                        {/* Hourly Energy Usage Chart (live — auto-refreshes every 30s) */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <HourlyUsageChart autoRefreshMs={30000} />
                        </motion.div>

                        {/* Bar + Pie Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                                <DailyUsageChart autoRefreshMs={30000} />
                            </motion.div>

                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                                <GlassCard className="p-6 h-full">
                                    <h3 className="text-base font-black mb-5 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                                        <Activity size={16} style={{ color: '#A78BFA' }} /> Device Distribution
                                    </h3>
                                    <div className="h-[140px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RechartsPieChart>
                                                <Pie data={mockDeviceData} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                                                    {mockDeviceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--navbar-border)', color: 'var(--text-color)' }} />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                                        {mockDeviceData.map((d, i) => (
                                            <div key={i} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                                                {d.name} <span style={{ color: d.color }}>{d.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </div>

                        {/* ── Device List ── */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                            <GlassCard className="p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                                        <Smartphone size={18} style={{ color: '#10B981' }} /> My Devices
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold px-3 py-1 rounded-full"
                                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                                            {activeCount}/{devices.length} active
                                        </span>
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => navigate('/devices')}
                                            className="text-xs font-bold px-3 py-1 rounded-full border transition-colors"
                                            style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                                            View All →
                                        </motion.button>
                                    </div>
                                </div>

                                {loadingDevices ? (
                                    <div className="flex items-center justify-center py-12">
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                            <Loader size={32} style={{ color: '#10B981' }} />
                                        </motion.div>
                                    </div>
                                ) : devices.length === 0 ? (
                                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-12">
                                        <div className="text-5xl mb-3">📱</div>
                                        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-color)' }}>No devices added yet</h3>
                                        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                                            Start by adding your first device to monitor energy usage.
                                        </p>
                                        {canEdit && (
                                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => setIsModalOpen(true)}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                                                style={{ background: 'linear-gradient(135deg, #10B981, #22C55E)' }}>
                                                <Plus size={18} /> Add Your First Device
                                            </motion.button>
                                        )}
                                    </motion.div>
                                ) : (
                                    <div className="space-y-3">
                                        <AnimatePresence>
                                            {devices.slice(0, 6).map((device, idx) => {
                                                const DevIcon = deviceIcons[device.type] || deviceIcons.default;
                                                const isOn = device.isOnline === true;
                                                return (
                                                    <motion.div key={device.id} layout
                                                        initial={{ opacity: 0, x: 16 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -16 }}
                                                        transition={{ delay: idx * 0.04 }}
                                                        className="flex items-center gap-3 p-3.5 rounded-xl border group transition-all duration-200"
                                                        style={{
                                                            background: isOn ? 'rgba(16,185,129,0.07)' : 'var(--glass-surface)',
                                                            borderColor: isOn ? 'rgba(16,185,129,0.2)' : 'var(--border-color)',
                                                        }}>
                                                        {/* Icon */}
                                                        <div className="p-2 rounded-lg flex-shrink-0"
                                                            style={{ background: isOn ? 'rgba(16,185,129,0.15)' : 'var(--glass-surface)' }}>
                                                            <DevIcon size={18} style={{ color: isOn ? '#10B981' : 'var(--text-secondary)' }} />
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-sm truncate" style={{ color: 'var(--text-color)' }}>{device.name}</p>
                                                            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                                                                {device.type?.replace(/_/g, ' ')}
                                                                {device.location ? ` · ${device.location}` : ''}
                                                            </p>
                                                        </div>

                                                        {/* Power */}
                                                        {device.powerRating && (
                                                            <span className="text-xs font-semibold flex-shrink-0 hidden sm:block"
                                                                style={{ color: 'var(--text-secondary)' }}>
                                                                {device.powerRating} kW
                                                            </span>
                                                        )}

                                                        {/* Status badge */}
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                                                            style={{
                                                                background: isOn ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
                                                                color: isOn ? '#10B981' : '#6B7280',
                                                            }}>
                                                            {isOn ? 'ON' : 'OFF'}
                                                        </span>

                                                        {/* Actions — only for canEdit */}
                                                        {canEdit && (
                                                            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {/* Toggle */}
                                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleToggle(device)}
                                                                    disabled={togglingId === device.id}
                                                                    className="p-1.5 rounded-lg transition-colors"
                                                                    style={{ color: isOn ? '#10B981' : 'var(--text-secondary)' }}
                                                                    title={isOn ? 'Turn Off' : 'Turn On'}>
                                                                    {togglingId === device.id
                                                                        ? <Loader size={15} className="animate-spin" />
                                                                        : isOn ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                                </motion.button>
                                                                {/* Edit */}
                                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                    onClick={() => navigate('/devices')}
                                                                    className="p-1.5 rounded-lg transition-colors"
                                                                    style={{ color: '#60A5FA' }} title="Edit device">
                                                                    <Edit2 size={14} />
                                                                </motion.button>
                                                                {/* Delete */}
                                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                    onClick={() => handleDelete(device.id)}
                                                                    disabled={deletingId === device.id}
                                                                    className="p-1.5 rounded-lg transition-colors"
                                                                    style={{ color: '#EF4444' }} title="Delete device">
                                                                    {deletingId === device.id
                                                                        ? <Loader size={14} className="animate-spin" />
                                                                        : <Trash2 size={14} />}
                                                                </motion.button>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                        {devices.length > 6 && (
                                            <motion.button whileHover={{ scale: 1.01 }} onClick={() => navigate('/devices')}
                                                className="w-full py-3 rounded-xl text-sm font-bold border transition-colors"
                                                style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                                                View all {devices.length} devices →
                                            </motion.button>
                                        )}
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>

                        {/* Smart Recommendation */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                            <GlassCard className="p-5" style={{ borderColor: 'rgba(16,185,129,0.15)' }}>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl flex-shrink-0"
                                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        <Leaf size={20} style={{ color: '#10B981' }} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#10B981' }}>💡 Smart Recommendation</span>
                                        </div>
                                        <p className="font-semibold text-base" style={{ color: 'var(--text-color)' }}>Use AC after 8 PM to save up to 15% on your energy bill</p>
                                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Off-peak rates apply 8 PM – 6 AM • Est. savings $18/month</p>
                                    </div>
                                    <div className="hidden sm:flex flex-col items-center gap-0.5">
                                        <span className="text-3xl font-black" style={{ color: '#22C55E' }}>15%</span>
                                        <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>savings</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="xl:col-span-4 space-y-5">
                        {/* Energy Score */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                            <GlassCard className="p-6 text-center" style={{ borderColor: 'rgba(16,185,129,0.15)' }}>
                                <p className="text-sm font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-secondary)' }}>Energy Efficiency Score</p>
                                <div className="relative inline-flex items-center justify-center mb-3">
                                    <CircularProgress value={82} size={130} strokeWidth={11} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black" style={{ color: 'var(--text-color)' }}>82</span>
                                        <span className="text-base font-bold" style={{ color: '#10B981' }}>/ 100</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 text-sm font-bold" style={{ color: '#10B981' }}>
                                    <Leaf size={14} /> Excellent Performance
                                </div>
                                <div className="mt-5 space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm font-semibold mb-1.5">
                                            <span style={{ color: 'var(--text-secondary)' }}>Peak Usage</span>
                                            <span style={{ color: '#EF4444' }}>3.8 kW</span>
                                        </div>
                                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                                            <motion.div className="h-full rounded-full bg-red-500"
                                                initial={{ width: 0 }} animate={{ width: '76%' }} transition={{ delay: 0.8, duration: 0.8 }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm font-semibold mb-1.5">
                                            <span style={{ color: 'var(--text-secondary)' }}>Off-Peak Usage</span>
                                            <span style={{ color: '#10B981' }}>1.2 kW</span>
                                        </div>
                                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                                            <motion.div className="h-full rounded-full" style={{ background: '#10B981' }}
                                                initial={{ width: 0 }} animate={{ width: '24%' }} transition={{ delay: 0.9, duration: 0.8 }} />
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Power Status */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <GlassCard className="p-5" style={{ borderColor: 'rgba(16,185,129,0.12)' }}>
                                <h3 className="text-base font-black mb-4 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                                    <Battery size={17} style={{ color: '#10B981' }} /> Power Status
                                </h3>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Battery Level</span>
                                    <span className="text-2xl font-black" style={{ color: '#10B981' }}>85%</span>
                                </div>
                                <div className="w-full h-3 rounded-full overflow-hidden mb-4" style={{ background: 'var(--border-color)' }}>
                                    <motion.div className="h-full rounded-full"
                                        style={{ background: 'linear-gradient(90deg, #10B981, #22C55E)' }}
                                        initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }} />
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Grid</div>
                                        <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--text-color)' }}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Connected
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>Solar Input</div>
                                        <div className="text-base font-black" style={{ color: '#FCD34D' }}>4.2 kW</div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Quick stats from real data */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}>
                            <GlassCard className="p-5">
                                <h3 className="text-base font-black mb-4 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                                    <Zap size={17} style={{ color: '#F59E0B' }} /> Device Breakdown
                                </h3>
                                {loadingDevices ? (
                                    <div className="py-4 flex justify-center">
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                            <Loader size={22} style={{ color: '#10B981' }} />
                                        </motion.div>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {[
                                            { label: 'Online', value: devices.filter(d => d.isOnline).length, color: '#10B981' },
                                            { label: 'Offline', value: devices.filter(d => !d.isOnline).length, color: '#6B7280' },
                                            { label: 'Currently ON', value: activeCount, color: '#22C55E' },
                                            { label: 'Currently OFF', value: devices.length - activeCount, color: '#EF4444' },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center justify-between">
                                                <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                                <span className="text-sm font-black" style={{ color: item.color }}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>

                        {/* ── Energy Saving Tips (Milestone 5) ── */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <GlassCard className="p-6">
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                                    <Lightbulb style={{ color: '#F59E0B' }} size={20} />
                                    Energy Saving Tips
                                </h3>
                                {loadingInsights ? (
                                    <div className="flex items-center justify-center p-6"><Loader className="animate-spin" style={{ color: '#10B981' }} /></div>
                                ) : insights?.tips?.length > 0 ? (
                                    <ul className="space-y-3">
                                        {insights.tips.map((tip, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                                                <span className="flex-shrink-0" style={{ color: '#10B981' }}>💡</span>
                                                <span style={{ color: 'var(--text-color)' }}>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-center p-4 italic" style={{ color: 'var(--text-secondary)' }}>
                                        Not enough data to generate insights yet. Check back later!
                                    </p>
                                )}
                            </GlassCard>
                        </motion.div>

                        {/* ── Overload Threshold Settings (Milestone 5) ── */}
                        {canEdit && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                                <GlassCard className="p-6">
                                    <h3 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                                        <Settings style={{ color: '#A78BFA' }} size={20} />
                                        Overload Threshold
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                            Max Daily Consumption (kWh)
                                        </label>
                                        <div className="flex gap-2">
                                            <input type="number" step="0.1" value={thresholdInput === '' ? '' : thresholdInput} onChange={e => setThresholdInput(e.target.value)}
                                                className="w-full px-3 py-2 rounded-xl text-sm font-semibold"
                                                style={{ background: 'var(--glass-surface)', border: '1px solid var(--glass-border)', color: 'var(--text-color)', outline: 'none' }}
                                            />
                                            <button onClick={handleSaveThreshold} disabled={savingThreshold}
                                                className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all whitespace-nowrap flex items-center justify-center min-w-[80px]"
                                                style={{ background: 'linear-gradient(135deg, #10B981, #22C55E)' }}>
                                                {savingThreshold ? <Loader size={16} className="animate-spin" /> : 'Save'}
                                            </button>
                                        </div>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                            Currently set to: <span className="font-bold">{threshold?.thresholdKwh || 'None'} </span>
                                        </p>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        )}

                        {/* Weekly Savings badge */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                            <GlassCard className="p-5" style={{ borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(16,185,129,0.06)' }}>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)' }}>
                                        <Flame size={20} style={{ color: '#22C55E' }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-widest" style={{ color: '#22C55E' }}>Weekly Savings</p>
                                        <p className="text-3xl font-black" style={{ color: 'var(--text-color)' }}>$32.50</p>
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>+18% better than last week 🌱</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* ── Floating Add Button (mobile) ── */}
            {canEdit && (
                <motion.button
                    whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setIsModalOpen(true)}
                    className="fixed bottom-28 right-6 w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center z-30 xl:hidden"
                    style={{ background: 'linear-gradient(135deg, #10B981, #22C55E)', boxShadow: '0 8px 32px rgba(16,185,129,0.45)' }}>
                    <Plus size={26} strokeWidth={3} />
                </motion.button>
            )}

            {/* ── Add Device Modal ── */}
            <AddDeviceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddDevice}
                isLoading={isAddingDevice}
            />
        </div>
    );
};

export default Dashboard;
