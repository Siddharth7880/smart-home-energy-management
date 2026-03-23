import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { deviceApi, automationApi } from '../services/api';
import {
    Clock, Plus, Trash2, Edit2, Loader, AlertCircle, CheckCircle2,
    Zap, Calendar, Power, ChevronDown, X, Save, Play, RefreshCw,
    Activity, Timer, Bell, TrendingUp
} from 'lucide-react';

// ── Device type → Icon mapping ────────────────────────────────────────────────
const DEVICE_ICONS = {
    light: '💡', lighting: '💡', bulb: '💡',
    ac: '❄️', air_conditioner: '❄️', hvac: '❄️',
    fridge: '🧊', refrigerator: '🧊',
    tv: '📺', speaker: '🔊',
    thermostat: '🌡️', heater: '🔥',
    washer: '🫧', dryer: '♻️',
    water_heater: '💧',
    solar_panel: '☀️',
    ev_charger: '⚡',
    smart_meter: '📊',
    plug: '🔌',
    lock: '🔒',
    camera: '📷',
    custom: '🔧',
};
const deviceIcon = (type) => DEVICE_ICONS[(type || '').toLowerCase()] || '📱';

// ── GlassCard ─────────────────────────────────────────────────────────────────
const GlassCard = ({ children, className = '', style = {}, ...props }) => (
    <div className={`rounded-2xl border relative overflow-hidden ${className}`}
        style={{
            background: 'var(--glass-surface)', backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)', borderColor: 'var(--glass-border)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.15)', ...style
        }} {...props}>
        <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--accent-glow), transparent)' }} />
        {children}
    </div>
);

// ── StatusBadge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ executed }) => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
        style={{
            background: executed ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
            color: executed ? '#10B981' : '#F59E0B',
            border: `1px solid ${executed ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`
        }}>
        {executed ? <CheckCircle2 size={11} /> : <Clock size={11} className="animate-pulse" />}
        {executed ? 'Executed' : 'Pending'}
    </span>
);

// ── ActionBadge ───────────────────────────────────────────────────────────────
const ActionBadge = ({ action }) => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-black"
        style={{
            background: action === 'ON' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: action === 'ON' ? '#22C55E' : '#EF4444',
        }}>
        <Power size={10} /> {action}
    </span>
);

// ── Countdown Timer ───────────────────────────────────────────────────────────
const Countdown = ({ scheduledAt }) => {
    const [remaining, setRemaining] = useState('');

    useEffect(() => {
        const calc = () => {
            const diff = new Date(scheduledAt) - Date.now();
            if (diff <= 0) { setRemaining('Due now'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            if (h > 23) {
                const days = Math.floor(h / 24);
                setRemaining(`${days}d ${h % 24}h`);
            } else if (h > 0) {
                setRemaining(`${h}h ${m}m ${s}s`);
            } else if (m > 0) {
                setRemaining(`${m}m ${s}s`);
            } else {
                setRemaining(`${s}s`);
            }
        };
        calc();
        const id = setInterval(calc, 1000);
        return () => clearInterval(id);
    }, [scheduledAt]);

    const isImminent = new Date(scheduledAt) - Date.now() < 300000; // < 5 min

    return (
        <span className="inline-flex items-center gap-1 text-xs font-bold"
            style={{ color: isImminent ? '#F59E0B' : '#60A5FA' }}>
            <Timer size={10} className={isImminent ? 'animate-pulse' : ''} />
            {remaining}
        </span>
    );
};

// ── Date/time helpers ─────────────────────────────────────────────────────────
function formatDateTime(dt) {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function toLocalInputValue(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Schedule Form Modal ───────────────────────────────────────────────────────
const ScheduleModal = ({ isOpen, onClose, onSave, devices, editSchedule, isLoading }) => {
    const [form, setForm] = useState({ deviceId: '', action: 'ON', scheduledAt: '', label: '' });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (editSchedule) {
            setForm({
                deviceId: String(editSchedule.deviceId),
                action: editSchedule.action,
                scheduledAt: toLocalInputValue(editSchedule.scheduledAt),
                label: editSchedule.label || ''
            });
        } else {
            const soon = new Date(Date.now() + 5 * 60000);
            setForm({
                deviceId: devices[0]?.id ? String(devices[0].id) : '',
                action: 'ON',
                scheduledAt: toLocalInputValue(soon),
                label: ''
            });
        }
        setFormError('');
    }, [editSchedule, isOpen, devices]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        if (!form.deviceId) return setFormError('Please select a device');
        if (!form.scheduledAt) return setFormError('Please set a scheduled time');
        // IMPORTANT: Keep the 'Z' suffix — this tells the backend the time is UTC.
        // The frontend datetime-local input is in local time, so we convert to UTC ISO string.
        onSave({
            deviceId: Number(form.deviceId),
            action: form.action,
            // DO NOT strip 'Z' — the backend needs it to correctly deserialize as UTC
            scheduledAt: new Date(form.scheduledAt).toISOString(),
            label: form.label || undefined
        });
    };

    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)' }}>
                <motion.div initial={{ scale: 0.88, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.88, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="w-full max-w-md">
                    <GlassCard className="p-6" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #10B981, #22C55E)' }}>
                                    <Calendar size={16} className="text-white" />
                                </div>
                                <h2 className="text-lg font-black" style={{ color: 'var(--text-color)' }}>
                                    {editSchedule ? 'Edit Schedule' : 'New Schedule'}
                                </h2>
                            </div>
                            <button onClick={onClose}
                                className="p-1.5 rounded-xl transition-all hover:scale-110"
                                style={{ color: 'var(--text-secondary)', background: 'rgba(239,68,68,0.08)' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Device selector */}
                            <div>
                                <label className="block text-xs font-bold mb-2 uppercase tracking-wider"
                                    style={{ color: 'var(--text-secondary)' }}>
                                    🖥️ Device
                                </label>
                                <div className="relative">
                                    <select value={form.deviceId}
                                        onChange={e => setForm(f => ({ ...f, deviceId: e.target.value }))}
                                        className="w-full px-3 py-3 rounded-xl text-sm font-semibold appearance-none pr-8"
                                        style={{
                                            background: 'var(--glass-surface)',
                                            border: '1px solid var(--glass-border)',
                                            color: 'var(--text-color)', outline: 'none'
                                        }}>
                                        <option value="" disabled>Select a device...</option>
                                        {devices.map(d => (
                                            <option key={d.id} value={d.id} style={{ background: 'var(--card-bg)' }}>
                                                {deviceIcon(d.type)} {d.name} ({(d.type || '').replace(/_/g, ' ')})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ color: 'var(--text-secondary)' }} />
                                </div>
                            </div>

                            {/* Action */}
                            <div>
                                <label className="block text-xs font-bold mb-2 uppercase tracking-wider"
                                    style={{ color: 'var(--text-secondary)' }}>⚡ Action</label>
                                <div className="flex gap-3">
                                    {['ON', 'OFF'].map(act => (
                                        <button key={act} type="button"
                                            onClick={() => setForm(f => ({ ...f, action: act }))}
                                            className="flex-1 py-3 rounded-xl font-black text-sm border transition-all"
                                            style={{
                                                background: form.action === act
                                                    ? (act === 'ON' ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)')
                                                    : 'transparent',
                                                borderColor: form.action === act
                                                    ? (act === 'ON' ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)')
                                                    : 'var(--glass-border)',
                                                color: form.action === act
                                                    ? (act === 'ON' ? '#22C55E' : '#EF4444')
                                                    : 'var(--text-secondary)',
                                                transform: form.action === act ? 'scale(1.02)' : 'scale(1)',
                                            }}>
                                            <Power size={13} className="inline mb-0.5 mr-1" /> {act}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scheduled time */}
                            <div>
                                <label className="block text-xs font-bold mb-2 uppercase tracking-wider"
                                    style={{ color: 'var(--text-secondary)' }}>🕐 Scheduled Time</label>
                                <input type="datetime-local"
                                    value={form.scheduledAt}
                                    onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                                    className="w-full px-3 py-3 rounded-xl text-sm font-semibold"
                                    style={{
                                        background: 'var(--glass-surface)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-color)', outline: 'none',
                                        colorScheme: 'dark'
                                    }} />
                            </div>

                            {/* Label */}
                            <div>
                                <label className="block text-xs font-bold mb-2 uppercase tracking-wider"
                                    style={{ color: 'var(--text-secondary)' }}>🏷️ Label <span className="normal-case font-normal">(optional)</span></label>
                                <input type="text" placeholder="e.g. Night AC off, Morning lights on..."
                                    value={form.label}
                                    onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                                    className="w-full px-3 py-3 rounded-xl text-sm font-semibold"
                                    style={{
                                        background: 'var(--glass-surface)', border: '1px solid var(--glass-border)',
                                        color: 'var(--text-color)', outline: 'none'
                                    }} />
                            </div>

                            {formError && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                    className="text-xs font-semibold text-red-400 flex items-center gap-1.5 p-2 rounded-lg"
                                    style={{ background: 'rgba(239,68,68,0.08)' }}>
                                    <AlertCircle size={13} /> {formError}
                                </motion.p>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={onClose}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all hover:opacity-80"
                                    style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                                    Cancel
                                </button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    type="submit" disabled={isLoading}
                                    className="flex-1 py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #10B981, #22C55E)', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}>
                                    {isLoading ? <Loader size={15} className="animate-spin" /> : <Save size={15} />}
                                    {editSchedule ? 'Update Schedule' : 'Create Schedule'}
                                </motion.button>
                            </div>
                        </form>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ── Stats Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon: Icon, delay = 0 }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
        <GlassCard className="p-5 text-center group hover:scale-105 transition-transform duration-200 cursor-default">
            <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={18} style={{ color }} />
            </div>
            <div className="text-2xl font-black mb-0.5" style={{ color }}>{value}</div>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</div>
        </GlassCard>
    </motion.div>
);

// ── Main Automation Page ──────────────────────────────────────────────────────
const Automation = () => {
    const { user } = useAuth();

    const [schedules, setSchedules] = useState([]);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editSchedule, setEditSchedule] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [triggeringId, setTriggeringId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [isPolling, setIsPolling] = useState(false);
    const pollingRef = useRef(null);

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3500);
    };

    const fetchData = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setIsPolling(true);
            const [schRes, devRes] = await Promise.all([
                automationApi.getSchedules(),
                deviceApi.getDevices()
            ]);
            setSchedules(Array.isArray(schRes.data) ? schRes.data : []);
            const devs = devRes.data.devices || devRes.data || [];
            setDevices(Array.isArray(devs) ? devs : []);
        } catch (err) {
            if (!silent)
                setError(err.response?.data?.message || 'Failed to load automation data');
        } finally {
            setLoading(false);
            setIsPolling(false);
        }
    }, []);

    // Initial load
    useEffect(() => { fetchData(); }, [fetchData]);

    // Auto-poll every 30 seconds to pick up executions
    useEffect(() => {
        pollingRef.current = setInterval(() => fetchData(true), 30000);
        return () => clearInterval(pollingRef.current);
    }, [fetchData]);

    const handleSave = async (formData) => {
        try {
            setIsSaving(true);
            if (editSchedule) {
                const res = await automationApi.updateSchedule(editSchedule.id, formData);
                setSchedules(prev => prev.map(s => s.id === editSchedule.id ? res.data : s));
                showSuccess('Schedule updated successfully!');
            } else {
                const res = await automationApi.createSchedule(formData);
                setSchedules(prev => [res.data, ...prev]);
                showSuccess('Schedule created! The backend will execute it at the scheduled time.');
            }
            setIsModalOpen(false);
            setEditSchedule(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save schedule');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (scheduleId) => {
        if (!window.confirm('Delete this schedule?')) return;
        try {
            setDeletingId(scheduleId);
            await automationApi.deleteSchedule(scheduleId);
            setSchedules(prev => prev.filter(s => s.id !== scheduleId));
            showSuccess('Schedule deleted.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete schedule');
        } finally {
            setDeletingId(null);
        }
    };

    const handleTriggerNow = async (schedule) => {
        try {
            setTriggeringId(schedule.id);
            const res = await automationApi.triggerSchedule(schedule.id);
            setSchedules(prev => prev.map(s => s.id === schedule.id ? res.data : s));
            showSuccess(`⚡ "${schedule.deviceName}" turned ${schedule.action} immediately!`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to trigger schedule');
        } finally {
            setTriggeringId(null);
        }
    };

    const openEdit = (s) => { setEditSchedule(s); setIsModalOpen(true); };
    const openAdd = () => { setEditSchedule(null); setIsModalOpen(true); };

    const filtered = schedules.filter(s => {
        if (filterStatus === 'pending') return !s.executed;
        if (filterStatus === 'executed') return s.executed;
        return true;
    });

    const pendingCount = schedules.filter(s => !s.executed).length;
    const executedCount = schedules.length - pendingCount;

    return (
        <div className="min-h-screen p-4 md:p-8"
            style={{
                background: 'linear-gradient(135deg, var(--page-bg-from) 0%, var(--page-bg-mid) 30%, var(--page-bg-from) 70%, var(--page-bg-to) 100%)',
                color: 'var(--text-color)'
            }}>
            <div className="max-w-5xl mx-auto space-y-6">

                {/* ── Header ── */}
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(34,197,94,0.1))', border: '1px solid rgba(16,185,129,0.3)' }}>
                                ⚡
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight"
                                    style={{ color: 'var(--text-color)' }}>
                                    Device <span style={{ color: '#10B981' }}>Automation</span>
                                </h1>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    Schedule automatic ON/OFF commands • Runs every minute
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => fetchData(false)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border"
                            style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                            <RefreshCw size={15} className={isPolling ? 'animate-spin' : ''} />
                            Refresh
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={openAdd}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #10B981, #22C55E)', boxShadow: '0 4px 20px rgba(16,185,129,0.38)' }}>
                            <Plus size={18} /> Add Schedule
                        </motion.button>
                    </div>
                </motion.header>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="Total Schedules" value={schedules.length} color="#A78BFA" icon={Calendar} delay={0.05} />
                    <StatCard label="Pending" value={pendingCount} color="#F59E0B" icon={Timer} delay={0.1} />
                    <StatCard label="Executed" value={executedCount} color="#10B981" icon={CheckCircle2} delay={0.15} />
                    <StatCard label="Devices" value={devices.length} color="#60A5FA" icon={Activity} delay={0.2} />
                </div>

                {/* ── Notifications ── */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="p-4 rounded-2xl border flex items-center gap-3"
                            style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
                            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                            <span className="text-sm font-semibold text-red-400 flex-1">{error}</span>
                            <button onClick={() => setError('')} className="text-red-400 text-xs font-black hover:opacity-70 transition-opacity">✕</button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {successMsg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="p-4 rounded-2xl border flex items-center gap-3"
                            style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)' }}>
                            <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                            <span className="text-sm font-semibold text-green-400">{successMsg}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Schedule List ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                            <h2 className="text-base font-black flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                                <Zap size={16} style={{ color: '#10B981' }} />
                                Scheduled Tasks
                                {isPolling && (
                                    <span className="text-xs font-normal px-2 py-0.5 rounded-full"
                                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                                        <RefreshCw size={10} className="inline animate-spin mr-1" />syncing
                                    </span>
                                )}
                            </h2>
                            {/* Filter tabs */}
                            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--glass-border)' }}>
                                {[
                                    { key: 'all', label: `All (${schedules.length})` },
                                    { key: 'pending', label: `Pending (${pendingCount})` },
                                    { key: 'executed', label: `Done (${executedCount})` },
                                ].map((f, i, arr) => (
                                    <button key={f.key} onClick={() => setFilterStatus(f.key)}
                                        className="px-3 py-1.5 text-xs font-bold transition-all"
                                        style={{
                                            background: filterStatus === f.key ? 'rgba(16,185,129,0.15)' : 'transparent',
                                            color: filterStatus === f.key ? '#10B981' : 'var(--text-secondary)',
                                            borderRight: i < arr.length - 1 ? '1px solid var(--glass-border)' : 'none'
                                        }}>
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                    <Loader size={36} style={{ color: '#10B981' }} />
                                </motion.div>
                                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading schedules...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center py-16">
                                <div className="text-6xl mb-4">
                                    {filterStatus === 'executed' ? '✅' : filterStatus === 'pending' ? '⏳' : '📅'}
                                </div>
                                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-color)' }}>
                                    {filterStatus === 'all' ? 'No schedules yet' : `No ${filterStatus} schedules`}
                                </h3>
                                <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                                    {filterStatus === 'all'
                                        ? 'Automate your devices! Click "Add Schedule" to schedule a device ON/OFF command.'
                                        : `Switch to "All" to see all your schedules.`}
                                </p>
                                {filterStatus === 'all' && (
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={openAdd}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                                        style={{ background: 'linear-gradient(135deg, #10B981, #22C55E)' }}>
                                        <Plus size={16} /> Create First Schedule
                                    </motion.button>
                                )}
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {filtered.map((s, idx) => (
                                        <motion.div key={s.id} layout
                                            initial={{ opacity: 0, x: 16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -16, height: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group relative flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border transition-all duration-200"
                                            style={{
                                                background: s.executed ? 'rgba(16,185,129,0.04)' : 'rgba(245,158,11,0.04)',
                                                borderColor: s.executed ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                            }}
                                            whileHover={{ scale: 1.005 }}>

                                            {/* Device icon bubble */}
                                            <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                                                style={{
                                                    background: s.executed ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                                    border: `1px solid ${s.executed ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                                                }}>
                                                {deviceIcon(s.deviceType)}
                                            </div>

                                            {/* Main info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-black text-sm" style={{ color: 'var(--text-color)' }}>
                                                        {s.deviceName}
                                                    </span>
                                                    <ActionBadge action={s.action} />
                                                    <StatusBadge executed={s.executed} />
                                                </div>
                                                {s.label && (
                                                    <p className="text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                                                        🏷️ {s.label}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                        <Calendar size={11} />
                                                        {formatDateTime(s.scheduledAt)}
                                                    </span>
                                                    {!s.executed && new Date(s.scheduledAt) > new Date() && (
                                                        <Countdown scheduledAt={s.scheduledAt} />
                                                    )}
                                                    {s.executedAt && (
                                                        <span className="flex items-center gap-1 text-xs" style={{ color: '#10B981' }}>
                                                            <CheckCircle2 size={10} />
                                                            Ran {formatDateTime(s.executedAt)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action buttons (only on pending) */}
                                            {!s.executed && (
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    {/* Trigger now */}
                                                    <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleTriggerNow(s)}
                                                        disabled={triggeringId === s.id}
                                                        title="Trigger now"
                                                        className="p-2 rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                                                        style={{ color: '#FBBF24', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                                                        {triggeringId === s.id
                                                            ? <Loader size={13} className="animate-spin" />
                                                            : <Play size={13} />}
                                                    </motion.button>
                                                    {/* Edit */}
                                                    <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                                                        onClick={() => openEdit(s)}
                                                        title="Edit schedule"
                                                        className="p-2 rounded-xl transition-all"
                                                        style={{ color: '#60A5FA', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
                                                        <Edit2 size={13} />
                                                    </motion.button>
                                                    {/* Delete */}
                                                    <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDelete(s.id)}
                                                        disabled={deletingId === s.id}
                                                        title="Delete schedule"
                                                        className="p-2 rounded-xl transition-all"
                                                        style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                        {deletingId === s.id ? <Loader size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                                    </motion.button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>

                {/* ── How it works ── */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <GlassCard className="p-5" style={{ borderColor: 'rgba(16,185,129,0.15)' }}>
                        <div className="flex items-start gap-3">
                            <Bell size={18} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <p className="text-sm font-black mb-2" style={{ color: '#10B981' }}>How it works</p>
                                <div className="grid sm:grid-cols-3 gap-3">
                                    {[
                                        { icon: '📅', title: 'Schedule', desc: 'Set a device action at a future date & time' },
                                        { icon: '⏱️', title: 'Auto-Execute', desc: 'The backend checks for due schedules every minute and runs them automatically' },
                                        { icon: '⚡', title: 'Trigger Now', desc: 'Use the ▶ button to instantly fire any pending schedule for testing' },
                                    ].map((step, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="text-lg leading-none mt-0.5">{step.icon}</span>
                                            <div>
                                                <p className="text-xs font-bold" style={{ color: 'var(--text-color)' }}>{step.title}</p>
                                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* ── Modal ── */}
            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditSchedule(null); }}
                onSave={handleSave}
                devices={devices}
                editSchedule={editSchedule}
                isLoading={isSaving}
            />
        </div>
    );
};

export default Automation;
