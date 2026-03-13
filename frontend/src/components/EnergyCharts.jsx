import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { analyticsApi } from '../services/api';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { TrendingUp, BarChart3, Loader, AlertCircle, RefreshCw } from 'lucide-react';

// ── Shared tooltip ──────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="px-4 py-3 rounded-xl border text-sm"
            style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--accent-glow)',
                backdropFilter: 'blur(12px)',
            }}>
            <p className="font-bold mb-1 text-xs uppercase tracking-wider"
                style={{ color: '#10B981' }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="font-semibold" style={{ color: p.color }}>
                    {p.name}: {p.value} {p.name === 'energy' ? 'kWh' : '₹'}
                </p>
            ))}
        </div>
    );
};

// ── Glass Card wrapper ──────────────────────────────────────────────────────
const GlassCard = ({ children, className = '', style = {} }) => (
    <div className={`rounded-2xl border relative overflow-hidden ${className}`}
        style={{
            background: 'var(--glass-surface)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderColor: 'var(--glass-border)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.15)',
            transition: 'background 0.3s ease, border-color 0.3s ease',
            ...style,
        }}>
        <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--accent-glow), transparent)' }} />
        {children}
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// 1.  HourlyUsageChart
// ═══════════════════════════════════════════════════════════════════════════
export const HourlyUsageChart = ({ autoRefreshMs = 10000 }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const fetchData = useCallback(async () => {
        try {
            const res = await analyticsApi.getHourlyUsage(today);
            setData(res.data || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load hourly data');
        } finally {
            setLoading(false);
        }
    }, [today]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!cancelled) await fetchData();
        };
        run();
        const id = setInterval(fetchData, autoRefreshMs);
        return () => { cancelled = true; clearInterval(id); };
    }, [fetchData, autoRefreshMs]);

    return (
        <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-black flex items-center gap-2"
                        style={{ color: 'var(--text-color)' }}>
                        <TrendingUp size={18} style={{ color: '#10B981' }} /> Hourly Energy Usage
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        Today&apos;s consumption by hour — auto-refreshes
                    </p>
                </div>
                <motion.button whileHover={{ rotate: 180 }} onClick={fetchData}
                    className="p-1.5 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
                    <RefreshCw size={16} />
                </motion.button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-[240px]">
                    <motion.div animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Loader size={28} style={{ color: '#10B981' }} />
                    </motion.div>
                </div>
            ) : error ? (
                <div className="flex items-center gap-2 justify-center h-[240px] text-sm text-red-400">
                    <AlertCircle size={16} /> {error}
                </div>
            ) : (
                <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="hourlyGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false}
                                stroke="var(--border-color)" opacity={0.3} />
                            <XAxis dataKey="time" axisLine={false} tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                                interval={2} />
                            <YAxis axisLine={false} tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                                tickFormatter={(v) => `${v}`} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area type="monotone" dataKey="energy" name="energy"
                                stroke="#10B981" strokeWidth={2.5}
                                fillOpacity={1} fill="url(#hourlyGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </GlassCard>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 2.  DailyUsageChart
// ═══════════════════════════════════════════════════════════════════════════
export const DailyUsageChart = ({ autoRefreshMs = 30000 }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const fetchData = useCallback(async () => {
        try {
            const res = await analyticsApi.getDailyUsage(currentMonth);
            setData(res.data || []);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load daily data');
        } finally {
            setLoading(false);
        }
    }, [currentMonth]);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!cancelled) await fetchData();
        };
        run();
        const id = setInterval(fetchData, autoRefreshMs);
        return () => { cancelled = true; clearInterval(id); };
    }, [fetchData, autoRefreshMs]);

    return (
        <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-lg font-black flex items-center gap-2"
                        style={{ color: 'var(--text-color)' }}>
                        <BarChart3 size={18} style={{ color: '#60A5FA' }} /> Daily Energy Usage
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        This month&apos;s consumption by day
                    </p>
                </div>
                <motion.button whileHover={{ rotate: 180 }} onClick={fetchData}
                    className="p-1.5 rounded-lg" style={{ color: 'var(--text-secondary)' }}>
                    <RefreshCw size={16} />
                </motion.button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-[220px]">
                    <motion.div animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Loader size={28} style={{ color: '#60A5FA' }} />
                    </motion.div>
                </div>
            ) : error ? (
                <div className="flex items-center gap-2 justify-center h-[220px] text-sm text-red-400">
                    <AlertCircle size={16} /> {error}
                </div>
            ) : (
                <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <defs>
                                <linearGradient id="dailyBarGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#60A5FA" />
                                    <stop offset="100%" stopColor="#818CF8" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false}
                                stroke="var(--border-color)" opacity={0.3} />
                            <XAxis dataKey="time" axisLine={false} tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 9 }}
                                interval={Math.max(0, Math.floor(data.length / 8) - 1)} />
                            <YAxis axisLine={false} tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                            <Tooltip content={<ChartTooltip />}
                                cursor={{ fill: 'var(--navbar-border)', opacity: 0.2 }} />
                            <Bar dataKey="energy" name="energy"
                                fill="url(#dailyBarGrad)" radius={[4, 4, 0, 0]} barSize={14} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </GlassCard>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 3.  LiveUsageBanner — compact strip showing real-time total power
// ═══════════════════════════════════════════════════════════════════════════
export const LiveUsageBanner = ({ autoRefreshMs = 10000 }) => {
    const [data, setData] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await analyticsApi.getTotalLiveUsage();
            setData(res.data);
        } catch {
            // silently ignore — the banner is supplementary
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!cancelled) await fetchData();
        };
        run();
        const id = setInterval(fetchData, autoRefreshMs);
        return () => { cancelled = true; clearInterval(id); };
    }, [fetchData, autoRefreshMs]);

    if (!data) return null;

    return (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4 p-4 rounded-2xl border"
            style={{
                background: 'rgba(16,185,129,0.06)',
                borderColor: 'rgba(16,185,129,0.18)',
            }}>
            <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}>Live Power</p>
                <p className="text-2xl font-black" style={{ color: '#10B981' }}>
                    {data.totalWatts} <span className="text-sm font-semibold">W</span>
                </p>
            </div>
            <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}>Total kW</p>
                <p className="text-2xl font-black" style={{ color: '#22C55E' }}>
                    {data.totalKW} <span className="text-sm font-semibold">kW</span>
                </p>
            </div>
            <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}>Active Devices</p>
                <p className="text-2xl font-black" style={{ color: '#F59E0B' }}>
                    {data.activeDevices}
                </p>
            </div>
        </motion.div>
    );
};
