import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Input from './Input';
import Button from './Button';

const deviceTypes = [
  { value: 'thermostat', label: '🌡️ Thermostat' },
  { value: 'bulb', label: '💡 Smart Bulb' },
  { value: 'plug', label: '🔌 Smart Plug' },
  { value: 'lock', label: '🔐 Smart Lock' },
  { value: 'air_conditioner', label: '❄️ Air Conditioner' },
  { value: 'water_heater', label: '💧 Water Heater' },
  { value: 'solar_panel', label: '☀️ Solar Panel' },
  { value: 'ev_charger', label: '⚡ EV Charger' },
  { value: 'smart_meter', label: '📊 Smart Meter' },
  { value: 'lighting', label: '🕯️ Lighting' },
];

const AddDeviceModal = ({ isOpen, onClose, onAdd, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'thermostat',
    location: '',
    powerRating: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Device name is required';
    if (!formData.type) newErrors.type = 'Device type is required';
    if (formData.powerRating && isNaN(parseFloat(formData.powerRating))) {
      newErrors.powerRating = 'Power rating must be a number';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      onAdd({
        ...formData,
        powerRating: formData.powerRating ? parseFloat(formData.powerRating) : null,
      });
      setFormData({
        name: '',
        type: 'thermostat',
        location: '',
        powerRating: '',
        description: '',
      });
      setErrors({});
    } else {
      setErrors(newErrors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl p-8 w-full max-w-md shadow-2xl z-50 max-h-screen overflow-y-auto border"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>Add Device</h2>
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <X size={24} />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Device Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Living Room Thermostat"
                error={errors.name}
              />

              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>Device Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}
                >
                  {deviceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Living Room"
              />

              <Input
                label="Power Rating (kW)"
                name="powerRating"
                type="number"
                step="0.01"
                value={formData.powerRating}
                onChange={handleChange}
                placeholder="e.g., 2.5"
                error={errors.powerRating}
              />

              <Input
                label="Description (optional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add any notes..."
              />

              <div className="flex gap-3 mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={isLoading}
                >
                  Add Device
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddDeviceModal;
