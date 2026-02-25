import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { deviceApi } from '../services/api';
import DeviceCard from '../components/DeviceCard';
import AddDeviceModal from '../components/AddDeviceModal';
import BottomNavigation from '../components/BottomNavigation';

const DeviceManager = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDevices();
  }, [user, navigate]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await deviceApi.getDevices();
      setDevices(response.data.devices || []);
    } catch (err) {
      console.error('Error fetching devices:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load devices');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (formData) => {
    try {
      setIsAddingDevice(true);
      const response = await deviceApi.createDevice(formData);
      setDevices([...devices, response.data]);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add device');
    } finally {
      setIsAddingDevice(false);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!confirm('Are you sure you want to delete this device?')) return;

    try {
      await deviceApi.deleteDevice(deviceId);
      setDevices(devices.filter(d => d.id !== deviceId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete device');
    }
  };

  const handleSelectDevice = (device) => {
    navigate(`/devices/${device.id}`, { state: { device } });
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || device.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const deviceTypes = [...new Set(devices.map(d => d.type))];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-color)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-lg border-b shadow-sm" style={{ background: 'var(--navbar-bg)', borderColor: 'var(--navbar-border)' }}>
        <div className="max-w-screen-lg mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>My Devices</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and monitor your smart home devices</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        {/* Search and Filter */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-colors"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterType('all')}
              className="px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all"
              style={filterType === 'all'
                ? { background: 'linear-gradient(135deg, #10B981, #22C55E)', color: 'white' }
                : { background: 'var(--glass-surface)', color: 'var(--text-secondary)', border: '2px solid var(--border-color)' }}
            >
              All
            </motion.button>
            {deviceTypes.map(type => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterType(type)}
                className="px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all capitalize"
                style={filterType === type
                  ? { background: 'linear-gradient(135deg, #10B981, #22C55E)', color: 'white' }
                  : { background: 'var(--glass-surface)', color: 'var(--text-secondary)', border: '2px solid var(--border-color)' }}
              >
                {type.replace(/_/g, ' ')}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex gap-3 items-center"
            >
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-red-700 font-semibold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader className="text-green-600" size={40} />
            </motion.div>
          </motion.div>
        ) : filteredDevices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>No devices found</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              {devices.length === 0 ? 'Get started by adding your first smart device!' : 'No devices match your search.'}
            </p>
            {devices.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg"
              >
                <Plus size={20} />
                Add Your First Device
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredDevices.map(device => (
                <motion.div
                  key={device.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <DeviceCard
                    device={device}
                    onSelect={handleSelectDevice}
                    onDelete={handleDeleteDevice}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Floating Add Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-32 right-6 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center z-30 hover:shadow-green-500/50"
      >
        <Plus size={28} strokeWidth={3} />
      </motion.button>

      {/* Add Device Modal */}
      <AddDeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddDevice}
        isLoading={isAddingDevice}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default DeviceManager;
