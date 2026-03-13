import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Zap, TrendingUp, DollarSign, Clock, Activity,
  AlertTriangle, CheckCircle, XCircle, WifiOff,
  BarChart2, PieChart as PieIcon, Globe, Shield, Cpu, Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../services/api';
import BottomNavigation from '../components/BottomNavigation';

// ─── Color palette ────────────────────────────────────────────────────────────
const CHART_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#14B8A6'
];

const HEALTH_CONFIG = {
  NORMAL: { color: '#10B981', Icon: CheckCircle, bg: '#D1FAE5' },
  WARNING: { color: '#F59E0B', Icon: AlertTriangle, bg: '#FEF3C7' },
  CRITICAL: { color: '#EF4444', Icon: XCircle, bg: '#FEE2E2' },
  OFFLINE: { color: '#6B7280', Icon: WifiOff, bg: '#F3F4F6' },
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: 12,
      padding: '10px 16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 4, fontSize: 12 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 700, fontSize: 14 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}
          {p.name.toLowerCase().includes('energy') ? ' kWh' : ''}
          {p.name.toLowerCase().includes('cost') ? ' ₹' : ''}
        </p>
      ))}
    </div>
  );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ icon: Icon, label, value, unit, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: 'spring', stiffness: 200 }}
    className="rounded-2xl p-5 border shadow-lg"
    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
  >
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: color + '22' }}>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
    <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>
      {value}
    </p>
    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{unit}</p>
  </motion.div>
);

// ─── Main Analytics Page ──────────────────────────────────────────────────────
const Analytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.roles?.[0] || user?.role || '';

  const isAdmin = role.toLowerCase().includes('admin');
  const isTechnician = role.toLowerCase().includes('technician');

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview'); // overview | admin | technician
  const [summary, setSummary] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Set initial tab based on role
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (isTechnician && !isAdmin) setActiveTab('technician');
  }, [user]);

  const fetchSummary = useCallback(async (period) => {
    try {
      const res = await analyticsApi.getSummaryAnalytics(period);
      setSummary(res.data);
    } catch (e) {
      setError('Failed to load analytics data');
    }
  }, []);

  const fetchAdminData = useCallback(async (period) => {
    try {
      const res = await analyticsApi.getAdminGlobalAnalytics(period);
      setAdminData(res.data);
    } catch (e) {
      console.error('Admin analytics error:', e);
    }
  }, []);

  const fetchHealthData = useCallback(async () => {
    try {
      const res = await analyticsApi.getTechnicianDeviceHealth();
      setHealthData(res.data);
    } catch (e) {
      console.error('Health data error:', e);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');

    const promises = [fetchSummary(selectedPeriod)];
    if (isAdmin) promises.push(fetchAdminData(selectedPeriod));
    if (isAdmin || isTechnician) promises.push(fetchHealthData());

    Promise.all(promises).finally(() => setLoading(false));
  }, [user, selectedPeriod]);

  const periods = ['daily', 'weekly', 'monthly', 'yearly'];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2, show: true },
    { id: 'admin', label: 'Global', icon: Globe, show: isAdmin },
    { id: 'technician', label: 'Device Health', icon: Cpu, show: isAdmin || isTechnician },
  ].filter(t => t.show);

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--bg-color)' }}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 backdrop-blur-xl border-b"
        style={{ background: 'var(--navbar-bg)', borderColor: 'var(--navbar-border)' }}
      >
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600
                            flex items-center justify-center shadow-lg">
              <Zap size={20} color="white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                Energy Analytics
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Smart Home Energy Intelligence Platform
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">

        {/* ── Period Selector ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 justify-center flex-wrap"
        >
          {periods.map(p => (
            <motion.button
              key={p}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPeriod(p)}
              className="px-5 py-2 rounded-full font-semibold capitalize text-sm transition-all"
              style={selectedPeriod === p
                ? {
                  background: 'linear-gradient(135deg,#10B981,#22C55E)', color: 'white',
                  boxShadow: '0 4px 15px rgba(16,185,129,0.4)'
                }
                : {
                  background: 'var(--glass-surface)', color: 'var(--text-secondary)',
                  border: '1.5px solid var(--border-color)'
                }
              }
            >
              {p}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Role Tabs ─────────────────────────────────────────────── */}
        {tabs.length > 1 && (
          <div className="flex gap-1 p-1 rounded-2xl border"
            style={{ background: 'var(--glass-surface)', borderColor: 'var(--border-color)' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl
                           text-sm font-semibold transition-all"
                style={activeTab === id
                  ? { background: 'linear-gradient(135deg,#10B981,#22C55E)', color: 'white' }
                  : { color: 'var(--text-secondary)' }
                }
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        )}

        {/* ── Error Banner ───────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl border-2 border-red-300 bg-red-50 flex gap-3 items-center"
            >
              <AlertTriangle size={20} className="text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loading ────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader size={48} color="#10B981" />
            </motion.div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading analytics…</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
            {activeTab === 'overview' && summary && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SummaryCard icon={Zap} label="Total Energy" color="#10B981"
                    value={(summary.totalEnergyKwh || 0).toFixed(2)} unit="kWh consumed" delay={0.05} />
                  <SummaryCard icon={DollarSign} label="Estimated Cost" color="#F59E0B"
                    value={`₹${(summary.estimatedCostRs || 0).toFixed(2)}`} unit={`this ${selectedPeriod}`} delay={0.1} />
                  <SummaryCard icon={Clock} label="Peak Hour" color="#8B5CF6"
                    value={summary.peakHour || 'N/A'} unit="highest usage" delay={0.15} />
                  <SummaryCard icon={Activity} label="Devices" color="#3B82F6"
                    value={summary.activeDevices || 0} unit="active devices" delay={0.2} />
                </div>

                {/* Timeline Chart */}
                {summary.timeline?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-2xl p-6 border shadow-lg"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                  >
                    <div className="flex items-center gap-2 mb-5">
                      <TrendingUp size={20} color="#10B981" />
                      <h2 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>
                        Energy Usage Timeline
                      </h2>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={summary.timeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                          interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line type="monotone" dataKey="energy" name="Energy (kWh)"
                          stroke="#10B981" strokeWidth={2.5} dot={false}
                          activeDot={{ r: 6, fill: '#10B981' }} />
                        <Line type="monotone" dataKey="cost" name="Cost (₹)"
                          stroke="#F59E0B" strokeWidth={2} dot={false}
                          activeDot={{ r: 5, fill: '#F59E0B' }} strokeDasharray="4 2" />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}

                {/* Top Devices — Bar + Pie */}
                {summary.topDevices?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bar Chart */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="rounded-2xl p-6 border shadow-lg"
                      style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart2 size={18} color="#3B82F6" />
                        <h2 className="font-bold" style={{ color: 'var(--text-color)' }}>
                          Top Devices by Usage
                        </h2>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                          data={summary.topDevices.slice(0, 6).map(d => ({
                            name: d.deviceName?.length > 10
                              ? d.deviceName.slice(0, 9) + '…' : d.deviceName,
                            energy: d.energyKwh,
                          }))}
                          margin={{ top: 5, right: 10, bottom: 5, left: -10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                          <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="energy" name="Energy (kWh)" radius={[6, 6, 0, 0]}>
                            {summary.topDevices.slice(0, 6).map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>

                    {/* Pie Chart */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="rounded-2xl p-6 border shadow-lg"
                      style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <PieIcon size={18} color="#8B5CF6" />
                        <h2 className="font-bold" style={{ color: 'var(--text-color)' }}>
                          Consumption Share
                        </h2>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={summary.topDevices.slice(0, 6).map(d => ({
                              name: d.deviceName,
                              value: parseFloat(d.energyKwh.toFixed(3)),
                            }))}
                            cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                            paddingAngle={3} dataKey="value"
                          >
                            {summary.topDevices.slice(0, 6).map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => [`${v} kWh`, 'Energy']} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </div>
                )}

                {/* Device breakdown list */}
                {summary.topDevices?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border shadow-lg overflow-hidden"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                  >
                    <div className="px-6 py-4 border-b flex items-center gap-2"
                      style={{ borderColor: 'var(--border-color)' }}>
                      <Zap size={18} color="#10B981" />
                      <h2 className="font-bold" style={{ color: 'var(--text-color)' }}>
                        Device Breakdown
                      </h2>
                    </div>
                    {summary.topDevices.map((dev, i) => (
                      <motion.div
                        key={dev.deviceId}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.4 }}
                        className="px-6 py-4 border-b last:border-b-0"
                        style={{ borderColor: 'var(--border-color)' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white
                                            text-xs font-bold"
                              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}>
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-semibold" style={{ color: 'var(--text-color)' }}>
                                {dev.deviceName}
                              </p>
                              <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                                {dev.deviceType}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                              {(dev.energyKwh || 0).toFixed(4)}
                              <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>kWh</span>
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              ₹{(dev.costRs || 0).toFixed(2)} • {(dev.percentage || 0).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'var(--border-color)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(dev.percentage, 100)}%` }}
                            transition={{ duration: 0.6, delay: i * 0.05 + 0.5 }}
                            className="h-full rounded-full"
                            style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Empty state */}
                {!summary.topDevices?.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 rounded-2xl border"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                  >
                    <Activity size={48} color="#10B981" className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>
                      No energy data yet
                    </p>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                      Turn on your devices — energy logs will appear here automatically
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ═══════════════ ADMIN GLOBAL TAB ═══════════════ */}
            {activeTab === 'admin' && isAdmin && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {adminData ? (
                  <>
                    {/* Global summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <SummaryCard icon={Globe} label="Total System Energy" color="#10B981"
                        value={(adminData.totalEnergyKwh || 0).toFixed(2)} unit="kWh across all homes" />
                      <SummaryCard icon={DollarSign} label="System Revenue" color="#F59E0B"
                        value={`₹${(adminData.estimatedCostRs || 0).toFixed(0)}`} unit="estimated total cost" />
                      <SummaryCard icon={Shield} label="Households" color="#8B5CF6"
                        value={adminData.totalHouseholds || 0} unit="registered users" />
                      <SummaryCard icon={Activity} label="Active Devices" color="#3B82F6"
                        value={`${adminData.activeDevices}/${adminData.totalDevices}`} unit="online right now" />
                    </div>

                    {/* Peak hour */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-5 border"
                      style={{ background: 'linear-gradient(135deg,#7C3AED22,#3B82F622)', borderColor: '#8B5CF655' }}
                    >
                      <div className="flex items-center gap-3">
                        <Clock size={24} color="#8B5CF6" />
                        <div>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>System-Wide Peak Hour</p>
                          <p className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                            {adminData.peakHour || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Global timeline */}
                    {adminData.timeline?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl p-6 border shadow-lg"
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Globe size={18} color="#3B82F6" />
                          <h2 className="font-bold" style={{ color: 'var(--text-color)' }}>
                            System Energy Timeline
                          </h2>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={adminData.timeline} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                              interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="energy" name="Energy (kWh)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </motion.div>
                    )}

                    {/* Top consuming devices globally */}
                    {adminData.topDevices?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border shadow-lg overflow-hidden"
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                      >
                        <div className="px-6 py-4 border-b flex items-center gap-2"
                          style={{
                            borderColor: 'var(--border-color)',
                            background: 'linear-gradient(90deg,#3B82F611,transparent)'
                          }}>
                          <Globe size={18} color="#3B82F6" />
                          <h2 className="font-bold" style={{ color: 'var(--text-color)' }}>
                            Highest Consuming Devices (System-Wide)
                          </h2>
                        </div>
                        {adminData.topDevices.map((dev, i) => (
                          <div key={i} className="px-6 py-3 border-b last:border-b-0 flex items-center justify-between"
                            style={{ borderColor: 'var(--border-color)' }}>
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}>
                                {i + 1}
                              </span>
                              <div>
                                <p className="font-medium text-sm" style={{ color: 'var(--text-color)' }}>{dev.deviceName}</p>
                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{dev.deviceType}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                                {(dev.energyKwh || 0).toFixed(3)} kWh
                              </p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {(dev.percentage || 0).toFixed(1)}% of total
                              </p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16" style={{ color: 'var(--text-secondary)' }}>
                    No global data available
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════════ TECHNICIAN HEALTH TAB ═══════════════ */}
            {activeTab === 'technician' && (isAdmin || isTechnician) && (
              <motion.div
                key="technician"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Health legend */}
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(HEALTH_CONFIG).map(([status, conf]) => (
                    <div key={status} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                      style={{ background: conf.bg, color: conf.color }}>
                      <conf.Icon size={12} />
                      {status}
                    </div>
                  ))}
                </div>

                {/* Header counts */}
                {healthData.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(HEALTH_CONFIG).map(([status, conf]) => {
                      const count = healthData.filter(d => d.healthStatus === status).length;
                      return (
                        <motion.div
                          key={status}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-2xl p-4 text-center border"
                          style={{ background: conf.bg, borderColor: conf.color + '44' }}
                        >
                          <conf.Icon size={20} style={{ color: conf.color }} className="mx-auto mb-1" />
                          <p className="text-2xl font-bold" style={{ color: conf.color }}>{count}</p>
                          <p className="text-xs font-medium" style={{ color: conf.color }}>{status}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Device list */}
                {healthData.length > 0 ? (
                  <div className="space-y-3">
                    {healthData.map((device, i) => {
                      const conf = HEALTH_CONFIG[device.healthStatus] || HEALTH_CONFIG.NORMAL;
                      return (
                        <motion.div
                          key={device.deviceId}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="rounded-2xl p-4 border shadow-sm"
                          style={{
                            background: 'var(--card-bg)', borderColor: 'var(--border-color)',
                            borderLeft: `4px solid ${conf.color}`
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: conf.bg }}>
                                <conf.Icon size={20} style={{ color: conf.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold" style={{ color: 'var(--text-color)' }}>
                                    {device.deviceName}
                                  </p>
                                  <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                    style={{ background: conf.bg, color: conf.color }}>
                                    {device.healthStatus}
                                  </span>
                                </div>
                                <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                                  {device.deviceType} • {device.ownerName || 'Unknown Owner'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>
                                Score: {(device.anomalyScore || 0).toFixed(2)}×
                              </p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {device.deviceStatus} • {device.isOnline ? '🟢 Online' : '🔴 Offline'}
                              </p>
                            </div>
                          </div>

                          {/* Energy stats */}
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="rounded-xl p-3" style={{ background: 'var(--glass-surface)' }}>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                Historical Avg / log
                              </p>
                              <p className="font-bold" style={{ color: 'var(--text-color)' }}>
                                {(device.avgEnergyKwh || 0).toFixed(4)} kWh
                              </p>
                            </div>
                            <div className="rounded-xl p-3" style={{ background: 'var(--glass-surface)' }}>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                Last 24h Total
                              </p>
                              <p className="font-bold" style={{ color: conf.color }}>
                                {(device.recentEnergyKwh || 0).toFixed(4)} kWh
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 rounded-2xl border"
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                    <Cpu size={48} color="#10B981" className="mx-auto mb-4 opacity-30" />
                    <p style={{ color: 'var(--text-secondary)' }}>No devices to monitor</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Analytics;
