import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, LineChart, TrendingUp, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { deviceApi } from '../services/api';
import BottomNavigation from '../components/BottomNavigation';

const Analytics = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [energyData, setEnergyData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchAnalytics();
  }, [user, selectedPeriod, navigate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await deviceApi.getAllDeviceEnergyLogs(selectedPeriod);
      setEnergyData(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-color)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 backdrop-blur-lg border-b shadow-sm"
        style={{ background: 'var(--navbar-bg)', borderColor: 'var(--navbar-border)' }}
      >
        <div className="max-w-screen-lg mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>Energy Analytics</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Monitor your smart home energy consumption</p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-2 justify-center flex-wrap"
        >
          {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
            <motion.button
              key={period}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPeriod(period)}
              className="px-6 py-2 rounded-full font-semibold capitalize transition-all"
              style={selectedPeriod === period
                ? { background: 'linear-gradient(135deg, #10B981, #22C55E)', color: 'white' }
                : { background: 'var(--glass-surface)', color: 'var(--text-secondary)', border: '2px solid var(--border-color)' }}
            >
              {period}
            </motion.button>
          ))}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex gap-3 items-center"
          >
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-red-700 font-semibold">{error}</p>
          </motion.div>
        )}

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
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Consumption */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl p-6 shadow-lg border"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Total Consumption</h3>
                  <BarChart className="text-green-500" size={24} />
                </div>
                <p className="text-4xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
                  {(energyData?.totalConsumption || 0).toFixed(2)}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>kWh this {selectedPeriod}</p>
              </motion.div>

              {/* Total Cost */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl p-6 shadow-lg border"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Estimated Cost</h3>
                  <TrendingUp className="text-emerald-500" size={24} />
                </div>
                <p className="text-4xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
                  ${(energyData?.totalCost || 0).toFixed(2)}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Based on current rates</p>
              </motion.div>

              {/* Device Count */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl p-6 shadow-lg border"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Devices</h3>
                  <LineChart className="text-blue-500" size={24} />
                </div>
                <p className="text-4xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>
                  {energyData?.deviceLogs?.length || 0}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active devices</p>
              </motion.div>
            </div>

            {/* Device Details */}
            {energyData?.deviceLogs && energyData.deviceLogs.length > 0 ? (
              <motion.div variants={itemVariants} className="rounded-2xl shadow-lg overflow-hidden border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>Device Breakdown</h2>
                </div>
                <div>
                  {energyData.deviceLogs.map((device, index) => (
                    <motion.div
                      key={device.deviceId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-6 py-4 border-b last:border-b-0"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold" style={{ color: 'var(--text-color)' }}>{device.deviceName}</h3>
                          <p className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{device.deviceType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-500">{(device.consumption || 0).toFixed(2)}</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>kWh</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>Cost: ${(device.cost || 0).toFixed(2)}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{device.logCount} logs</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((device.consumption / (energyData.totalConsumption || 1)) * 100, 100)}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                variants={itemVariants}
                className="text-center py-12 rounded-2xl shadow-lg border"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No energy data available yet</p>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>Add devices and energy logs to see analytics</p>
              </motion.div>
            )}

            {/* Time Range Info */}
            {energyData && (
              <motion.div
                variants={itemVariants}
                className="text-center text-sm rounded-2xl p-4 border"
                style={{ color: 'var(--text-secondary)', background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
              >
                <p>
                  Period: {new Date(energyData.startDate).toLocaleDateString()} to{' '}
                  {new Date(energyData.endDate).toLocaleDateString()}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Analytics;
