import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Activity, Shield, Zap, TrendingUp, Settings, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [roleDistribution, setRoleDistribution] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [activeTab, setActiveTab] = useState('statistics');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes, distRes, usersRes] = await Promise.all([
                adminApi.getSystemStatistics(),
                adminApi.getRoleDistribution(),
                adminApi.getAllUsers()
            ]);

            setStats(statsRes.data);
            setRoleDistribution(distRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard data');
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    };

    const _handleUpdateUserRoles = async (userId, newRoles) => {
        try {
            await adminApi.updateUserRoles(userId, newRoles);
            setShowUserModal(false);
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update user roles');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await adminApi.deleteUser(userId);
                fetchDashboardData();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const handleDeactivateUser = async (userId) => {
        try {
            await adminApi.deactivateUser(userId);
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to deactivate user');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-color)' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Loader className="text-green-600" size={48} />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-8" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
            {/* Header */}
            <div className="sticky top-0 z-30 backdrop-blur-lg border-b shadow-sm" style={{ background: 'var(--navbar-bg)', borderColor: 'var(--navbar-border)' }}>
                <div className="max-w-screen-xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-color)' }}>
                                <Shield className="text-green-600" size={32} />
                                Admin Dashboard
                            </h1>
                            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.username}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full text-sm font-semibold shadow-lg">
                                ADMIN
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-screen-xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('statistics')}
                        className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'statistics'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                            : 'border-2'
                            }`}
                        style={{
                            background: activeTab === 'statistics' ? '' : 'var(--card-bg)',
                            color: activeTab === 'statistics' ? 'white' : 'var(--text-color)',
                            borderColor: activeTab === 'statistics' ? 'transparent' : 'var(--border-color)'
                        }}
                    >
                        <TrendingUp size={20} />
                        Statistics
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'users'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                            : 'border-2'
                            }`}
                        style={{
                            background: activeTab === 'users' ? '' : 'var(--card-bg)',
                            color: activeTab === 'users' ? 'white' : 'var(--text-color)',
                            borderColor: activeTab === 'users' ? 'transparent' : 'var(--border-color)'
                        }}
                    >
                        <Users size={20} />
                        Users ({users.length})
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'settings'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                            : 'border-2'
                            }`}
                        style={{
                            background: activeTab === 'settings' ? '' : 'var(--card-bg)',
                            color: activeTab === 'settings' ? 'white' : 'var(--text-color)',
                            borderColor: activeTab === 'settings' ? 'transparent' : 'var(--border-color)'
                        }}
                    >
                        <Settings size={20} />
                        Settings
                    </motion.button>
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
                            <p className="text-red-700 font-semibold">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Statistics Tab */}
                {activeTab === 'statistics' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>System Statistics</h2>
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    whileHover={{ y: -4 }}
                                    className="rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl"
                                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                                >
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                                            <Users className="text-blue-600" size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Users</p>
                                            <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>{stats.totalUsers}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                                            Active: {stats.activeUsers}
                                        </span>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    whileHover={{ y: -4 }}
                                    className="rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                                >
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-xl">
                                            <Activity className="text-green-600" size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Devices</p>
                                            <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>{stats.totalDevices}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    whileHover={{ y: -4 }}
                                    className="rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                                >
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl">
                                            <Settings className="text-purple-600" size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Installations</p>
                                            <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>{stats.totalInstallations}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    whileHover={{ y: -4 }}
                                    className="rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                                >
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl">
                                            <Zap className="text-amber-600" size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Energy Usage</p>
                                            <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>{stats.totalEnergyConsumption?.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>kWh</p>
                                </motion.div>
                            </div>
                        )}

                        {roleDistribution && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="rounded-2xl p-8 shadow-lg border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                            >
                                <h3 style={{ color: 'var(--text-color)' }}>User Distribution by Role</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border-2 border-red-200 transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-red-700 font-semibold text-lg">Admin</span>
                                            <Shield className="text-red-600" size={24} />
                                        </div>
                                        <p className="text-4xl font-bold text-red-600">{roleDistribution.ADMIN}</p>
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-green-700 font-semibold text-lg">Homeowner</span>
                                            <Users className="text-green-600" size={24} />
                                        </div>
                                        <p className="text-4xl font-bold text-green-600">{roleDistribution.HOMEOWNER}</p>
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200 transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-amber-700 font-semibold text-lg">Technician</span>
                                            <Activity className="text-amber-600" size={24} />
                                        </div>
                                        <p className="text-4xl font-bold text-amber-600">{roleDistribution.TECHNICIAN}</p>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 style={{ color: 'var(--text-color)' }}>User Management</h2>
                        <div className="rounded-2xl shadow-lg border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead style={{ background: 'var(--navbar-bg)', borderColor: 'var(--navbar-border)' }}>
                                        <tr>
                                            <th style={{ color: 'var(--text-color)' }}>Username</th>
                                            <th style={{ color: 'var(--text-color)' }}>Email</th>
                                            <th style={{ color: 'var(--text-color)' }}>Name</th>
                                            <th style={{ color: 'var(--text-color)' }}>Roles</th>
                                            <th style={{ color: 'var(--text-color)' }}>Status</th>
                                            <th style={{ color: 'var(--text-color)' }}>Created</th>
                                            <th style={{ color: 'var(--text-color)' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ borderColor: 'var(--border-color)' }}>
                                        {users.map((u, index) => (
                                            <motion.tr
                                                key={u.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="transition-colors"
                                                style={{ cursor: 'default' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-surface)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-semibold" style={{ color: 'var(--text-color)' }}>{u.username}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span style={{ color: 'var(--text-secondary)' }}>{u.email}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span style={{ color: 'var(--text-secondary)' }}>{u.firstName} {u.lastName}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2 flex-wrap">
                                                        {u.roles?.map(role => {
                                                            const roleClean = role.replace('ROLE_', '');
                                                            const colorClass =
                                                                roleClean === 'ADMIN' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                    roleClean === 'HOMEOWNER' ? 'bg-green-100 text-green-700 border-green-200' :
                                                                        'bg-amber-100 text-amber-700 border-amber-200';
                                                            return (
                                                                <span
                                                                    key={role}
                                                                    className={`px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}
                                                                >
                                                                    {roleClean}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.emailVerified
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                                                        }`}>
                                                        {u.emailVerified ? '✓ Verified' : '✗ Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                                        {new Date(u.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex gap-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-md"
                                                            onClick={() => {
                                                                setSelectedUser(u);
                                                                setShowUserModal(true);
                                                            }}
                                                        >
                                                            Edit
                                                        </motion.button>
                                                        {u.emailVerified ? (
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors shadow-md"
                                                                onClick={() => handleDeactivateUser(u.id)}
                                                            >
                                                                Deactivate
                                                            </motion.button>
                                                        ) : (
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors shadow-md"
                                                                onClick={() => handleDeleteUser(u.id)}
                                                            >
                                                                Delete
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>System Settings</h2>
                        <div className="rounded-2xl p-8 shadow-lg border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                                            Max Devices per Homeowner
                                        </label>
                                        <input
                                            type="number"
                                            defaultValue={50}
                                            className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors"
                                            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                                            Session Timeout (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            defaultValue={60}
                                            className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors"
                                            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: 'var(--glass-surface)', borderColor: 'var(--border-color)' }}>
                                    <input
                                        type="checkbox"
                                        id="email-verification"
                                        defaultChecked={true}
                                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                    />
                                    <label htmlFor="email-verification" className="text-sm font-semibold cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                                        Email Verification Required
                                    </label>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:shadow-green-500/50 transition-all"
                                >
                                    Save Settings
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* User Modal */}
                <AnimatePresence>
                    {showUserModal && selectedUser && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowUserModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="rounded-2xl p-8 max-w-md w-full shadow-2xl border"
                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>Update User Roles</h3>
                                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Username: <span className="font-semibold" style={{ color: 'var(--text-color)' }}>{selectedUser.username}</span></p>
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border-2 border-red-200">
                                        <input
                                            type="checkbox"
                                            id="role-admin"
                                            defaultChecked={selectedUser.roles?.includes('ROLE_ADMIN')}
                                            className="w-5 h-5 text-red-600 border-red-300 rounded focus:ring-red-500"
                                        />
                                        <label htmlFor="role-admin" className="font-semibold text-red-700 cursor-pointer flex-1">
                                            Admin
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                                        <input
                                            type="checkbox"
                                            id="role-homeowner"
                                            defaultChecked={selectedUser.roles?.includes('ROLE_HOMEOWNER')}
                                            className="w-5 h-5 text-green-600 border-green-300 rounded focus:ring-green-500"
                                        />
                                        <label htmlFor="role-homeowner" className="font-semibold text-green-700 cursor-pointer flex-1">
                                            Homeowner
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                                        <input
                                            type="checkbox"
                                            id="role-technician"
                                            defaultChecked={selectedUser.roles?.includes('ROLE_TECHNICIAN')}
                                            className="w-5 h-5 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                                        />
                                        <label htmlFor="role-technician" className="font-semibold text-amber-700 cursor-pointer flex-1">
                                            Technician
                                        </label>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold transition-colors"
                                        style={{ background: 'var(--glass-surface)', color: 'var(--text-secondary)' }}
                                        onClick={() => setShowUserModal(false)}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg hover:shadow-green-500/50 transition-all"
                                    >
                                        Update Roles
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminDashboard;