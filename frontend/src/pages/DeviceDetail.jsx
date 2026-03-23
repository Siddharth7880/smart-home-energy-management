import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Thermometer, Lightbulb, Plug, Lock, Wind, Droplet,
    Sun, Zap, Activity, Wifi, WifiOff, Trash2, Edit2, Loader,
    AlertCircle, ToggleLeft, ToggleRight, Clock, MapPin, Battery,
    Info, Save, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { deviceApi } from '../services/api';

const deviceIcons = {
    thermostat: Thermometer, bulb: Lightbulb, plug: Plug, lock: Lock,
    air_conditioner: Wind, water_heater: Droplet, solar_panel: Sun,
    ev_charger: Zap, smart_meter: Activity, lighting: Lightbulb,
    default: Plug,
};

const deviceTypes = [
    { value: 'thermostat', label: 'Thermostat' },
    { value: 'bulb', label: 'Smart Bulb' },
    { value: 'plug', label: 'Smart Plug' },
    { value: 'lock', label: 'Smart Lock' },
    { value: 'air_conditioner', label: 'Air Conditioner' },
    { value: 'water_heater', label: 'Water Heater' },
    { value: 'solar_panel', label: 'Solar Panel' },
    { value: 'ev_charger', label: 'EV Charger' },
    { value: 'smart_meter', label: 'Smart Meter' },
    { value: 'lighting', label: 'Lighting' },
];

const GlassCard = ({ children, className = '', style = {} }) => (
    <div
        className={`rounded-2xl border relative overflow-hidden ${className}`}
        style={{
            background: 'var(--glass-surface)', backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)', borderColor: 'var(--glass-border)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)', ...style,
        }}
    >
        <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, var(--accent-glow), transparent)' }} />
        {children}
    </div>
);

const DeviceDetail = () => {
    const { deviceId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Try to use the device object passed via navigation state to avoid extra fetch
    const passedDevice = location.state?.device || null;

    const [device, setDevice] = useState(passedDevice);
    const [loading, setLoading] = useState(!passedDevice);
    const [error, setError] = useState('');
    const [toggling, setToggling] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const roles = user?.roles || [];
    const isHomeowner = roles.some(r => r === 'ROLE_HOMEOWNER' || r === 'HOMEOWNER');
    const isAdmin = roles.some(r => r === 'ROLE_ADMIN' || r === 'ADMIN');
    const canEdit = isHomeowner || isAdmin;

    // Fetch full device details
    const fetchDevice = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const res = await deviceApi.getDeviceById(deviceId);
            setDevice(res.data);
        } catch (err) {
            if (err.response?.status === 401) { logout(); navigate('/login'); }
            else setError(err.response?.data?.message || 'Failed to load device details');
        } finally {
            setLoading(false);
        }
    }, [deviceId, logout, navigate]);

    // Fetch energy logs
    const fetchLogs = useCallback(async () => {
        try {
            setLogsLoading(true);
            const res = await deviceApi.getDeviceEnergyLogs(deviceId);
            setLogs(res.data || []);
        } catch {
            // Not critical — silently fail
        } finally {
            setLogsLoading(false);
        }
    }, [deviceId]);

    useEffect(() => {
        if (!passedDevice) fetchDevice();
        fetchLogs();
    }, [fetchDevice, fetchLogs, passedDevice]);

    const handleToggle = async () => {
        if (!device) return;
        try {
            setToggling(true);
            const res = await deviceApi.toggleDevice(device.id);
            setDevice(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to toggle device');
        } finally {
            setToggling(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${device?.name}"? This cannot be undone.`)) return;
        try {
            setDeleting(true);
            await deviceApi.deleteDevice(device.id);
            navigate('/devices', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete device');
            setDeleting(false);
        }
    };

    const startEdit = () => {
        setEditForm({
            name: device.name || '',
            type: device.type || 'plug',
            location: device.location || '',
            powerRating: device.powerRating ?? '',
            description: device.description || '',
        });
        setIsEditing(true);
    };

    const cancelEdit = () => { setIsEditing(false); setEditForm(null); };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                ...editForm,
                powerRating: editForm.powerRating !== '' ? parseFloat(editForm.powerRating) : null,
            };
            const res = await deviceApi.updateDevice(device.id, payload);
            setDevice(res.data);
            setIsEditing(false);
            setEditForm(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update device');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-color)' }}>
                <div className="flex flex-col items-center gap-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Loader size={40} style={{ color: '#10B981' }} />
                    </motion.div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading device…</p>
                </div>
            </div>
        );
    }

    if (error && !device) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-color)' }}>
                <div className="text-center space-y-4">
                    <AlertCircle size={48} className="mx-auto text-red-400" />
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>Failed to load device</h2>
                    <p className="text-sm text-red-400">{error}</p>
                    <button onClick={() => navigate('/devices')} className="px-5 py-2 rounded-xl font-bold text-sm text-white"
                        style={{ background: 'linear-gradient(135deg,#10B981,#22C55E)' }}>
                        ← Back to Devices
                    </button>
                </div>
            </div>
        );
    }

    const DevIcon = deviceIcons[device?.type] || deviceIcons.default;
    const isOn = device?.isOnline === true;

    return (
        <div className="min-h-screen p-4 md:p-8 pb-28" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/devices')}
                        className="p-2.5 rounded-xl border flex items-center gap-1.5 text-sm font-bold"
                        style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)', background: 'var(--glass-surface)' }}>
                        <ArrowLeft size={16} /> Back
                    </motion.button>
                    <h1 className="text-2xl font-black" style={{ color: 'var(--text-color)' }}>Device Details</h1>
                </motion.div>

                {/* Error banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="p-4 rounded-2xl border flex items-center gap-3"
                            style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
                            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                            <span className="text-sm font-semibold text-red-400">{error}</span>
                            <button onClick={() => setError('')} className="ml-auto text-red-400 font-bold">✕</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {device && (
                    <>
                        {/* Main device card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <GlassCard className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 rounded-2xl" style={{ background: isOn ? 'rgba(16,185,129,0.15)' : 'var(--glass-surface)' }}>
                                            <DevIcon size={32} style={{ color: isOn ? '#10B981' : 'var(--text-secondary)' }} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black" style={{ color: 'var(--text-color)' }}>{device.name}</h2>
                                            <p className="text-sm capitalize font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                                {device.type?.replace(/_/g, ' ')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {/* Online badge */}
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                                            style={{
                                                background: device.isOnline ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                                                color: device.isOnline ? '#10B981' : '#6B7280',
                                            }}>
                                            {device.isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                                            {device.isOnline ? 'Online' : 'Offline'}
                                        </div>
                                        {/* Status badge */}
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                                            style={{
                                                background: isOn ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                                color: isOn ? '#10B981' : '#EF4444',
                                            }}>
                                            {isOn ? '● ON' : '● OFF'}
                                        </div>
                                    </div>
                                </div>

                                {/* Info grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                                    {[
                                        { icon: MapPin, label: 'Location', value: device.location || 'Not set' },
                                        { icon: Battery, label: 'Power Rating', value: device.powerRating ? `${device.powerRating} kW` : 'Not set' },
                                        { icon: Clock, label: 'Added', value: device.createdAt ? new Date(device.createdAt).toLocaleDateString() : 'Unknown' },
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="p-3 rounded-xl" style={{ background: 'var(--glass-surface)' }}>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Icon size={12} style={{ color: '#10B981' }} />
                                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                                            </div>
                                            <p className="text-sm font-bold" style={{ color: 'var(--text-color)' }}>{value}</p>
                                        </div>
                                    ))}
                                </div>

                                {device.description && (
                                    <div className="mb-6 p-3 rounded-xl flex items-start gap-2" style={{ background: 'var(--glass-surface)' }}>
                                        <Info size={14} style={{ color: '#10B981' }} className="mt-0.5 flex-shrink-0" />
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{device.description}</p>
                                    </div>
                                )}

                                {/* Action buttons */}
                                {canEdit && (
                                    <div className="flex flex-wrap gap-3">
                                        {/* Toggle ON/OFF */}
                                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                            onClick={handleToggle} disabled={toggling}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                                            style={{ background: isOn ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg,#10B981,#22C55E)' }}>
                                            {toggling ? <Loader size={16} className="animate-spin" /> : isOn ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                            {toggling ? 'Switching…' : isOn ? 'Turn Off' : 'Turn On'}
                                        </motion.button>

                                        {/* Edit */}
                                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                            onClick={startEdit}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border"
                                            style={{ borderColor: 'rgba(96,165,250,0.3)', color: '#60A5FA', background: 'rgba(96,165,250,0.06)' }}>
                                            <Edit2 size={16} /> Edit
                                        </motion.button>

                                        {/* Delete */}
                                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                            onClick={handleDelete} disabled={deleting}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border ml-auto"
                                            style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#EF4444', background: 'rgba(239,68,68,0.06)' }}>
                                            {deleting ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            {deleting ? 'Deleting…' : 'Delete'}
                                        </motion.button>
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>

                        {/* Edit form modal */}
                        <AnimatePresence>
                            {isEditing && editForm && (
                                <>
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        onClick={cancelEdit}
                                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
                                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-3xl p-8 border"
                                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-black" style={{ color: 'var(--text-color)' }}>Edit Device</h3>
                                            <button onClick={cancelEdit} className="p-2 rounded-full" style={{ color: 'var(--text-secondary)' }}>
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <form onSubmit={handleSave} className="space-y-4">
                                            {[
                                                { label: 'Device Name', name: 'name', type: 'text', placeholder: 'e.g. Living Room Thermostat' },
                                                { label: 'Location', name: 'location', type: 'text', placeholder: 'e.g. Living Room' },
                                                { label: 'Power Rating (kW)', name: 'powerRating', type: 'number', placeholder: 'e.g. 2.5' },
                                                { label: 'Description', name: 'description', type: 'text', placeholder: 'Optional notes…' },
                                            ].map(field => (
                                                <div key={field.name} className="space-y-1.5">
                                                    <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                                                        {field.label}
                                                    </label>
                                                    <input
                                                        type={field.type}
                                                        step={field.name === 'powerRating' ? '0.01' : undefined}
                                                        placeholder={field.placeholder}
                                                        value={editForm[field.name]}
                                                        onChange={e => setEditForm(prev => ({ ...prev, [field.name]: e.target.value }))}
                                                        className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors text-sm"
                                                        style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}
                                                    />
                                                </div>
                                            ))}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                                                    Device Type
                                                </label>
                                                <select value={editForm.type}
                                                    onChange={e => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                                                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors text-sm"
                                                    style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}>
                                                    {deviceTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex gap-3 pt-2">
                                                <button type="submit" disabled={saving}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white"
                                                    style={{ background: 'linear-gradient(135deg,#10B981,#22C55E)' }}>
                                                    {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                                                    {saving ? 'Saving…' : 'Save Changes'}
                                                </button>
                                                <button type="button" onClick={cancelEdit}
                                                    className="flex-1 py-3 rounded-xl font-bold text-sm border"
                                                    style={{ borderColor: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        {/* Energy Logs */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <GlassCard className="p-6">
                                <h3 className="text-lg font-black mb-5 flex items-center gap-2" style={{ color: 'var(--text-color)' }}>
                                    <Activity size={18} style={{ color: '#10B981' }} /> Energy Logs
                                </h3>
                                {logsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                            <Loader size={28} style={{ color: '#10B981' }} />
                                        </motion.div>
                                    </div>
                                ) : logs.length === 0 ? (
                                    <div className="text-center py-10">
                                        <div className="text-4xl mb-2">📊</div>
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>No energy logs yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                        {logs.slice(0, 20).map((log, i) => (
                                            <motion.div key={log.id || i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="flex items-center justify-between p-3 rounded-xl border"
                                                style={{ background: 'var(--glass-surface)', borderColor: 'var(--glass-border)' }}>
                                                <div>
                                                    <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                                                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Unknown time'}
                                                    </p>
                                                    {log.notes && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{log.notes}</p>}
                                                </div>
                                                <span className="text-sm font-black" style={{ color: '#10B981' }}>
                                                    {(log.energyUsed || 0).toFixed(2)} kWh
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DeviceDetail;
