import { motion } from 'framer-motion';
import { Thermometer, Lightbulb, Plug, Lock, Wind, Droplet, Sun, Zap, Wifi, WifiOff } from 'lucide-react';

const deviceIcons = {
  thermostat: Thermometer,
  bulb: Lightbulb,
  plug: Plug,
  lock: Lock,
  air_conditioner: Wind,
  water_heater: Droplet,
  solar_panel: Sun,
  ev_charger: Zap,
  default: Plug,
};

const DeviceCard = ({ device, onSelect, onDelete }) => {
  const Icon = deviceIcons[device.type] || deviceIcons.default;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border overflow-hidden relative group"
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      {/* Hover overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
        style={{ background: 'rgba(16,185,129,0.04)' }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.12)' }}>
              <Icon className="text-green-500" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-color)' }}>{device.name}</h3>
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{device.type?.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {device.isOnline ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.12)' }}>
                <Wifi size={12} className="text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-500">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'var(--glass-surface)' }}>
                <WifiOff size={12} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* Energy usage */}
        {device.currentEnergyUsage !== undefined && (
          <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--glass-surface)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Today's Usage</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-green-500">{(device.currentEnergyUsage || 0).toFixed(2)}</span>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>kWh</span>
            </div>
          </div>
        )}

        {/* Location */}
        {device.location && (
          <div className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>📍 {device.location}</div>
        )}

        {/* Power Rating */}
        {device.powerRating && (
          <div className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Power: {device.powerRating} kW</div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(device)}
            className="flex-1 py-2 px-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #10B981, #22C55E)' }}
          >
            Details →
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(device.id)}
            className="py-2 px-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
          >
            Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default DeviceCard;
