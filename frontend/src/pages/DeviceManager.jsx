import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Loader, AlertCircle, Search, Zap, Wifi, WifiOff,
  Edit2, Trash2, X, CheckCircle, ToggleLeft, ToggleRight,
  Thermometer, Lightbulb, Wind, Tv, Refrigerator, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { deviceApi } from '../services/api';
import BottomNavigation from '../components/BottomNavigation';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const DEVICE_TYPES = ['light', 'ac', 'fridge', 'tv', 'custom', 'bulb', 'thermostat',
  'plug', 'lock', 'air_conditioner', 'heater', 'washer', 'dryer',
  'refrigerator', 'water_heater', 'solar_panel', 'ev_charger',
  'smart_meter', 'lighting', 'speaker', 'camera', 'hvac'];

const TYPE_ICONS = {
  light: Lightbulb, lighting: Lightbulb, bulb: Lightbulb,
  ac: Wind, air_conditioner: Wind, hvac: Wind,
  fridge: Refrigerator, refrigerator: Refrigerator,
  tv: Tv, speaker: Tv,
  thermostat: Thermometer, heater: Thermometer, water_heater: Thermometer,
};
const getIcon = (type) => TYPE_ICONS[type?.toLowerCase()] || Settings;

const TYPE_COLORS = {
  light: '#F59E0B', lighting: '#F59E0B', bulb: '#F59E0B',
  ac: '#06B6D4', air_conditioner: '#06B6D4', hvac: '#06B6D4',
  fridge: '#3B82F6', refrigerator: '#3B82F6',
  tv: '#8B5CF6', speaker: '#8B5CF6',
  thermostat: '#EF4444', heater: '#EF4444', water_heater: '#EF4444',
};
const getColor = (type) => TYPE_COLORS[type?.toLowerCase()] || '#10B981';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Glassmorphism device card */
const DeviceCard = ({ device, onToggle, onEdit, onDelete, toggling }) => {
  const Icon = getIcon(device.type);
  const color = getColor(device.type);
  const isOn = device.isOnline;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -10 }}
      whileHover={{ y: -4 }}
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${isOn ? color + '44' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '20px',
        padding: '20px',
        boxShadow: isOn
          ? `0 8px 32px ${color}22, 0 0 0 1px ${color}33`
          : '0 4px 24px rgba(0,0,0,0.3)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow blob when ON */}
      {isOn && (
        <div style={{
          position: 'absolute', top: -20, right: -20, width: 120, height: 120,
          background: color, borderRadius: '50%', opacity: 0.08, filter: 'blur(30px)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: isOn ? color + '22' : 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${isOn ? color + '44' : 'rgba(255,255,255,0.1)'}`,
          }}>
            <Icon size={22} color={isOn ? color : '#6B7280'} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#F9FAFB', margin: 0, lineHeight: 1.3 }}>
              {device.name}
            </p>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, textTransform: 'capitalize' }}>
              {device.type?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* ON/OFF Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggle(device.id)}
          disabled={toggling === device.id}
          style={{
            background: 'none', border: 'none', cursor: toggling === device.id ? 'wait' : 'pointer',
            padding: 0, display: 'flex', alignItems: 'center',
          }}
          title={isOn ? 'Turn OFF' : 'Turn ON'}
        >
          {toggling === device.id ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
              <Loader size={26} color="#6B7280" />
            </motion.div>
          ) : isOn ? (
            <ToggleRight size={32} color={color} />
          ) : (
            <ToggleLeft size={32} color="#4B5563" />
          )}
        </motion.button>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 10px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ fontSize: 10, color: '#6B7280', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Power
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#E5E7EB', margin: 0 }}>
            {device.powerRating ? `${(device.powerRating * 1000).toFixed(0)} W` : '—'}
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 10px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ fontSize: 10, color: '#6B7280', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Today
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#E5E7EB', margin: 0 }}>
            {device.currentEnergyUsage ? `${device.currentEnergyUsage.toFixed(3)} kWh` : '0 kWh'}
          </p>
        </div>
      </div>

      {/* Status pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <motion.div
            animate={isOn ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isOn ? color : '#4B5563',
              boxShadow: isOn ? `0 0 6px ${color}` : 'none',
            }}
          />
          <span style={{ fontSize: 12, color: isOn ? color : '#6B7280', fontWeight: 600 }}>
            {isOn ? 'Online' : 'Offline'}
          </span>
          {device.location && (
            <span style={{ fontSize: 11, color: '#4B5563', marginLeft: 4 }}>
              · {device.location}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(device)}
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Edit"
          >
            <Edit2 size={14} color="#9CA3AF" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(device)}
            style={{
              width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Delete"
          >
            <Trash2 size={14} color="#EF4444" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

/** Reusable Modal wrapper */
const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '16px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(145deg, rgba(17,24,39,0.98), rgba(31,41,55,0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, padding: 28, width: '100%', maxWidth: 480,
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#F9FAFB' }}>{title}</h3>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={16} color="#9CA3AF" />
            </motion.button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 14,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#F3F4F6', outline: 'none', boxSizing: 'border-box',
  marginBottom: 12,
};
const labelStyle = { fontSize: 12, color: '#9CA3AF', marginBottom: 4, display: 'block', fontWeight: 500 };

/** Device form used by both Add and Edit modals */
const DeviceForm = ({ initial, onSubmit, onCancel, loading, submitLabel }) => {
  const [form, setForm] = useState({
    name: '', type: 'light', powerRating: '', location: '', description: '',
    ...initial,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <label style={labelStyle}>Device Name *</label>
      <input
        style={inputStyle} required value={form.name} placeholder="e.g. Living Room Bulb"
        onChange={e => set('name', e.target.value)}
      />

      <label style={labelStyle}>Type *</label>
      <select
        style={{ ...inputStyle, cursor: 'pointer' }}
        value={form.type}
        onChange={e => set('type', e.target.value)}
        required
      >
        {DEVICE_TYPES.map(t => (
          <option key={t} value={t} style={{ background: '#1F2937' }}>
            {t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </option>
        ))}
      </select>

      <label style={labelStyle}>Power Rating (Watts) *</label>
      <input
        style={inputStyle} required type="number" min="1" step="0.1"
        value={form.powerRating} placeholder="e.g. 60"
        onChange={e => set('powerRating', e.target.value)}
      />

      <label style={labelStyle}>Location</label>
      <input
        style={inputStyle} value={form.location} placeholder="e.g. Living Room"
        onChange={e => set('location', e.target.value)}
      />

      <label style={labelStyle}>Description</label>
      <input
        style={{ ...inputStyle, marginBottom: 20 }} value={form.description}
        placeholder="Optional description"
        onChange={e => set('description', e.target.value)}
      />

      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button
          type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          style={{
            flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)', color: '#9CA3AF', cursor: 'pointer', fontWeight: 600, fontSize: 14,
          }}
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          disabled={loading}
          style={{
            flex: 2, padding: '12px', borderRadius: 12, border: 'none',
            background: loading ? '#374151' : 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {loading ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }}><Loader size={16} /></motion.div> Saving…</> : submitLabel}
        </motion.button>
      </div>
    </form>
  );
};

/** Delete confirmation dialog */
const DeleteConfirm = ({ device, onConfirm, onCancel, loading }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
      <Trash2 size={26} color="#EF4444" />
    </div>
    <p style={{ color: '#D1D5DB', margin: '0 0 6px', fontSize: 15 }}>
      Delete <strong style={{ color: '#F9FAFB' }}>{device?.name}</strong>?
    </p>
    <p style={{ color: '#6B7280', margin: '0 0 24px', fontSize: 13 }}>
      This will also remove all associated usage logs. This cannot be undone.
    </p>
    <div style={{ display: 'flex', gap: 10 }}>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onCancel}
        style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#9CA3AF', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
        Cancel
      </motion.button>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onConfirm} disabled={loading}
        style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: loading ? '#374151' : 'linear-gradient(135deg, #EF4444, #DC2626)', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {loading ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }}><Loader size={14} /></motion.div> Deleting…</> : 'Delete'}
      </motion.button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main DeviceManager component
// ─────────────────────────────────────────────────────────────────────────────
const DeviceManager = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modal state
  const [addOpen, setAddOpen] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [deleteDevice, setDeleteDevice] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toggling, setToggling] = useState(null); // deviceId being toggled

  // Stats
  const [totalPower, setTotalPower] = useState({ totalPowerWatts: 0, activeDevices: 0 });

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAll();
  }, [user, navigate]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [devRes, pwRes] = await Promise.all([
        deviceApi.getDevices(),
        deviceApi.getTotalPower().catch(() => ({ data: { totalPowerWatts: 0, activeDevices: 0 } })),
      ]);
      setDevices(devRes.data.devices || []);
      setTotalPower(pwRes.data);
    } catch (err) {
      if (err.response?.status === 401) { logout(); navigate('/login'); }
      else setError(err.response?.data?.message || 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ── Device CRUD handlers ──────────────────────────────────────────────────
  const handleAddDevice = async (form) => {
    setActionLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        powerRating: parseFloat(form.powerRating) / 1000, // convert W to kW for storage
        location: form.location,
        description: form.description,
      };
      const res = await deviceApi.createDevice(payload);
      setDevices(prev => [res.data, ...prev]);
      setAddOpen(false);
      showSuccess(`"${res.data.name}" added successfully!`);
      // Refresh total power
      deviceApi.getTotalPower().then(r => setTotalPower(r.data)).catch(() => { });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add device');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditDevice = async (form) => {
    setActionLoading(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        powerRating: parseFloat(form.powerRating) / 1000,
        location: form.location,
        description: form.description,
      };
      const res = await deviceApi.updateDevice(editDevice.id, payload);
      setDevices(prev => prev.map(d => d.id === editDevice.id ? res.data : d));
      setEditDevice(null);
      showSuccess(`"${res.data.name}" updated successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update device');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDevice = async () => {
    if (!deleteDevice) return;
    setActionLoading(true);
    setError('');
    try {
      await deviceApi.deleteDevice(deleteDevice.id);
      setDevices(prev => prev.filter(d => d.id !== deleteDevice.id));
      showSuccess(`"${deleteDevice.name}" deleted.`);
      setDeleteDevice(null);
      deviceApi.getTotalPower().then(r => setTotalPower(r.data)).catch(() => { });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete device');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (deviceId) => {
    setToggling(deviceId);
    setError('');
    try {
      const res = await deviceApi.toggleDevice(deviceId);
      setDevices(prev => prev.map(d => d.id === deviceId ? res.data : d));
      // Refresh total power after toggle
      deviceApi.getTotalPower().then(r => setTotalPower(r.data)).catch(() => { });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle device');
    } finally {
      setToggling(null);
    }
  };

  // ── Edit modal: convert kW stored value back to W for display
  const openEdit = (device) => {
    setEditDevice({
      ...device,
      powerRating: device.powerRating ? (device.powerRating * 1000).toFixed(1) : '',
    });
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredDevices = devices.filter(d => {
    const q = searchQuery.toLowerCase();
    const matchSearch = d.name.toLowerCase().includes(q) || d.type.toLowerCase().includes(q);
    const matchFilter = filterType === 'all' || d.type === filterType;
    return matchSearch && matchFilter;
  });

  const deviceTypes = [...new Set(devices.map(d => d.type))];
  const activeCount = devices.filter(d => d.isOnline).length;
  const totalWatts = devices.filter(d => d.isOnline)
    .reduce((sum, d) => sum + (d.powerRating ? d.powerRating * 1000 : 0), 0);

  // ── Edit initial form values ───────────────────────────────────────────────
  const editInitial = editDevice ? {
    name: editDevice.name || '',
    type: editDevice.type || 'light',
    powerRating: editDevice.powerRating || '',
    location: editDevice.location || '',
    description: editDevice.description || '',
  } : {};

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', paddingBottom: 96, background: 'linear-gradient(135deg, #0F172A 0%, #111827 50%, #0F172A 100%)' }}>

      {/* ── Sticky Header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 16px 12px',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
                My Devices
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
                {devices.length} device{devices.length !== 1 ? 's' : ''} · {activeCount} active
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Total Devices', value: devices.length, color: '#10B981' },
              { label: 'Active Now', value: activeCount, color: '#06B6D4' },
              { label: 'Live Load', value: `${totalWatts.toFixed(0)} W`, color: '#F59E0B' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <p style={{ margin: 0, fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} size={18} color="#6B7280" />
            <input
              type="text" placeholder="Search devices…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 10px 10px 38px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, color: '#F3F4F6', fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px' }}>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
          {['all', ...deviceTypes].map(t => (
            <motion.button
              key={t} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setFilterType(t)}
              style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                whiteSpace: 'nowrap', cursor: 'pointer', border: 'none',
                background: filterType === t
                  ? 'linear-gradient(135deg, #10B981, #059669)'
                  : 'rgba(255,255,255,0.05)',
                color: filterType === t ? 'white' : '#9CA3AF',
                boxShadow: filterType === t ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
              }}
            >
              {t === 'all' ? 'All' : t.replace(/_/g, ' ')}
            </motion.button>
          ))}
        </div>

        {/* Toast messages */}
        <AnimatePresence>
          {error && (
            <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} color="#EF4444" />
              <span style={{ color: '#FCA5A5', fontSize: 14, fontWeight: 500 }}>{error}</span>
              <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={16} /></button>
            </motion.div>
          )}
          {successMsg && (
            <motion.div key="ok" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={18} color="#10B981" />
              <span style={{ color: '#6EE7B7', fontSize: 14, fontWeight: 500 }}>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Device grid */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Zap size={40} color="#10B981" />
            </motion.div>
          </div>
        ) : filteredDevices.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚡</div>
            <h2 style={{ color: '#F9FAFB', margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>
              {devices.length === 0 ? 'No devices yet' : 'No results found'}
            </h2>
            <p style={{ color: '#6B7280', margin: '0 0 24px', fontSize: 14 }}>
              {devices.length === 0
                ? 'Add your first smart home device to get started.'
                : 'Try a different search or filter.'}
            </p>
            {devices.length === 0 && (
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setAddOpen(true)}
                style={{ padding: '12px 28px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Plus size={18} /> Add First Device
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}
          >
            <AnimatePresence mode="popLayout">
              {filteredDevices.map(device => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  toggling={toggling}
                  onToggle={handleToggle}
                  onEdit={openEdit}
                  onDelete={setDeleteDevice}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Floating Add Button ── */}
      <motion.button
        whileHover={{ scale: 1.1, boxShadow: '0 12px 32px rgba(16,185,129,0.5)' }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setAddOpen(true)}
        style={{
          position: 'fixed', bottom: 88, right: 20, width: 58, height: 58,
          borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(16,185,129,0.4)', zIndex: 40,
        }}
      >
        <Plus size={26} color="white" strokeWidth={2.5} />
      </motion.button>

      {/* ── Add Modal ── */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Device">
        <DeviceForm
          initial={{ name: '', type: 'light', powerRating: '', location: '', description: '' }}
          onSubmit={handleAddDevice}
          onCancel={() => setAddOpen(false)}
          loading={actionLoading}
          submitLabel="Add Device"
        />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={!!editDevice} onClose={() => setEditDevice(null)} title="Edit Device">
        {editDevice && (
          <DeviceForm
            initial={editInitial}
            onSubmit={handleEditDevice}
            onCancel={() => setEditDevice(null)}
            loading={actionLoading}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={!!deleteDevice} onClose={() => setDeleteDevice(null)} title="Delete Device">
        <DeleteConfirm
          device={deleteDevice}
          onConfirm={handleDeleteDevice}
          onCancel={() => setDeleteDevice(null)}
          loading={actionLoading}
        />
      </Modal>

      <BottomNavigation />
    </div>
  );
};

export default DeviceManager;
