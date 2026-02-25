import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, TrendingUp, CheckCircle, Clock, Star, MapPin, FileText, Loader, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { technicianApi } from '../services/api';

const TechnicianTracker = () => {
    const { user } = useAuth();
    const [installations, setInstallations] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInstallation, setSelectedInstallation] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notes, setNotes] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('pending');

    useEffect(() => {
        fetchInstallations();
        fetchMetrics();
    }, []);

    const fetchInstallations = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await technicianApi.getMyInstallations();
            setInstallations(res.data.installations || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load installations');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMetrics = async () => {
        try {
            const res = await technicianApi.getMyMetrics();
            setMetrics(res.data);
        } catch (err) {
            console.error('Error loading metrics:', err);
        }
    };

    const handleUpdateStatus = async (installationId, newStatus) => {
        try {
            await technicianApi.updateInstallationStatus(installationId, newStatus);
            setShowDetailsModal(false);
            fetchInstallations();
            fetchMetrics();
            alert('Status updated successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleAddNotes = async () => {
        if (!notes.trim()) {
            alert('Please enter a note');
            return;
        }
        try {
            await technicianApi.addNotes(selectedInstallation.id, notes);
            setShowNotesModal(false);
            setNotes('');
            fetchInstallations();
            alert('Note added successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add note');
        }
    };

    const handleCompleteInstallation = async (installationId) => {
        if (window.confirm('Mark this installation as completed?')) {
            try {
                await technicianApi.completeInstallation(installationId);
                fetchInstallations();
                fetchMetrics();
                alert('Installation marked as completed!');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to complete installation');
            }
        }
    };

    const filteredInstallations = installations.filter(inst => {
        if (filter === 'all') return true;
        return inst.status === filter;
    });

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
        <div className="min-h-screen pb-8" style={{ background: 'var(--bg-color)' }}>
            {/* Header */}
            <div className="sticky top-0 z-30 backdrop-blur-lg border-b shadow-sm" style={{ background: 'var(--navbar-bg)', borderColor: 'var(--navbar-border)' }}>
                <div className="max-w-screen-xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-color)' }}>
                                <Wrench className="text-green-500" size={32} />
                                Installation Tracker
                            </h1>
                            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.username}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-semibold shadow-lg">
                                TECHNICIAN
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-screen-xl mx-auto px-6 py-8">
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

                {/* Performance Metrics */}
                <div>
                    <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>Your Performance Metrics</h2>
                    {metrics && (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ y: -4 }}
                                className="rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-3 mb-3"><div className="p-3 rounded-xl" style={{ background: 'rgba(96,165,250,0.15)' }}><TrendingUp className="text-blue-500" size={24} /></div></div>
                                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Total Installations</p>
                                <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>{metrics.totalInstallations}</p>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ y: -4 }}
                                className="rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-3 mb-3"><div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)' }}><CheckCircle className="text-green-500" size={24} /></div></div>
                                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Completed</p>
                                <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>{metrics.completedInstallations}</p>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ y: -4 }}
                                className="rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-3 mb-3"><div className="p-3 rounded-xl" style={{ background: 'rgba(139,92,246,0.15)' }}><TrendingUp className="text-purple-500" size={24} /></div></div>
                                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Completion Rate</p>
                                <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>{(metrics.completionRate * 100).toFixed(1)}%</p>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} whileHover={{ y: -4 }}
                                className="rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-3 mb-3"><div className="p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.15)' }}><Clock className="text-amber-500" size={24} /></div></div>
                                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Avg Time</p>
                                <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>{metrics.averageCompletionTime?.toFixed(1)}</p>
                                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>hours</p>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} whileHover={{ y: -4 }}
                                className="rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                <div className="flex items-center gap-3 mb-3"><div className="p-3 rounded-xl" style={{ background: 'rgba(234,179,8,0.15)' }}><Star className="text-yellow-500" size={24} /></div></div>
                                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Rating</p>
                                <p className="text-3xl font-bold" style={{ color: 'var(--text-color)' }}>⭐ {metrics.rating?.toFixed(1)}</p>
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Installations Section */}
                <div>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
                            Assigned Installations ({filteredInstallations.length})
                        </h2>
                        {/* Filter Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            {[['all', 'All', '#10B981'], ['pending', 'Pending', '#F59E0B'], ['in_progress', 'In Progress', '#8B5CF6'], ['completed', 'Completed', '#10B981']].map(([val, label, color]) => (
                                <motion.button key={val} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => setFilter(val)}
                                    className="px-5 py-2 rounded-full font-semibold whitespace-nowrap transition-all"
                                    style={filter === val
                                        ? { background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: 'white' }
                                        : { background: 'var(--glass-surface)', color: 'var(--text-secondary)', border: '2px solid var(--border-color)' }}
                                >
                                    {label}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Installation Cards */}
                    {filteredInstallations.length === 0 ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16 rounded-2xl shadow-lg border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                            <div className="text-6xl mb-4">🔧</div>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>No installations found</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>No {filter !== 'all' ? filter.replace('_', ' ') : ''} installations assigned.</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredInstallations.map((inst, index) => {
                                const statusColors = {
                                    'pending': { badge: '#F59E0B', borderCss: 'rgba(245,158,11,0.4)', text: '#92400E', bgCss: 'rgba(245,158,11,0.08)' },
                                    'in_progress': { badge: '#8B5CF6', borderCss: 'rgba(139,92,246,0.4)', text: '#5B21B6', bgCss: 'rgba(139,92,246,0.08)' },
                                    'completed': { badge: '#10B981', borderCss: 'rgba(16,185,129,0.4)', text: '#065F46', bgCss: 'rgba(16,185,129,0.08)' },
                                    'cancelled': { badge: '#6B7280', borderCss: 'rgba(107,114,128,0.4)', text: '#374151', bgCss: 'rgba(107,114,128,0.08)' }
                                };
                                const colors = statusColors[inst.status] || statusColors['pending'];

                                return (
                                    <motion.div
                                        key={inst.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -4 }}
                                        className="rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 hover:shadow-xl"
                                        style={{ background: 'var(--card-bg)', borderColor: colors.borderCss }}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-color)' }}>Installation #{inst.id}</h3>
                                            </div>
                                            <span className="px-4 py-1 text-white rounded-full text-xs font-bold uppercase" style={{ background: colors.badge }}>{inst.status.replace('_', ' ')}</span>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                                                <div>
                                                    <p className="text-xs font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>Location</p>
                                                    <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{inst.location}</p>
                                                </div>
                                            </div>
                                            {inst.description && (
                                                <div className="flex items-start gap-3">
                                                    <FileText className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
                                                    <div>
                                                        <p className="text-xs font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>Description</p>
                                                        <p style={{ color: 'var(--text-secondary)' }}>{inst.description}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {inst.scheduledDate && (
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="text-purple-500 flex-shrink-0 mt-0.5" size={18} />
                                                    <div>
                                                        <p className="text-xs font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>Scheduled Date</p>
                                                        <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{new Date(inst.scheduledDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {inst.estimatedDurationHours && (
                                                <div className="flex items-start gap-3">
                                                    <Clock className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                                                    <div>
                                                        <p className="text-xs font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>Estimated Duration</p>
                                                        <p className="font-semibold" style={{ color: 'var(--text-color)' }}>{inst.estimatedDurationHours} hours</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {inst.notes && (
                                            <div className="rounded-xl p-4 mb-4 border" style={{ background: colors.bgCss, borderColor: colors.borderCss }}>
                                                <p className="text-xs font-bold uppercase mb-1" style={{ color: colors.text }}>📌 Notes</p>
                                                <p style={{ color: 'var(--text-secondary)' }}>{inst.notes}</p>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                className="flex-1 px-4 py-2 text-white rounded-xl font-semibold transition-colors shadow-md"
                                                style={{ background: '#3B82F6' }}
                                                onClick={() => { setSelectedInstallation(inst); setSelectedStatus(inst.status); setShowDetailsModal(true); }}>
                                                View Details
                                            </motion.button>
                                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                className="flex-1 px-4 py-2 text-white rounded-xl font-semibold transition-colors shadow-md"
                                                style={{ background: '#8B5CF6' }}
                                                onClick={() => { setSelectedInstallation(inst); setShowNotesModal(true); }}>
                                                Add Notes
                                            </motion.button>
                                            {inst.status !== 'completed' && inst.status !== 'cancelled' && (
                                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                    className="px-4 py-2 text-white rounded-xl font-semibold transition-colors shadow-md"
                                                    style={{ background: '#10B981' }}
                                                    onClick={() => handleCompleteInstallation(inst.id)}>
                                                    ✓
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Details Modal */}
                <AnimatePresence>
                    {showDetailsModal && selectedInstallation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowDetailsModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="rounded-2xl p-8 max-w-md w-full shadow-2xl border"
                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>Installation Details</h3>
                                <div className="space-y-4 mb-6">
                                    {[['ID', selectedInstallation.id], ['Location', selectedInstallation.location], ['Current Status', selectedInstallation.status.replace('_', ' ')], ['Created', new Date(selectedInstallation.createdAt).toLocaleDateString()]].map(([label, val]) => (
                                        <div key={label} className="flex justify-between">
                                            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{label}:</span>
                                            <span className="font-bold capitalize" style={{ color: 'var(--text-color)' }}>{val}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Update Status:</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors font-semibold"
                                        style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="flex gap-3">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold transition-colors"
                                        style={{ background: 'var(--glass-surface)', color: 'var(--text-secondary)' }}
                                        onClick={() => setShowDetailsModal(false)}>
                                        Close
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg transition-all"
                                        onClick={() => handleUpdateStatus(selectedInstallation.id, selectedStatus)}>
                                        Update Status
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notes Modal */}
                <AnimatePresence>
                    {showNotesModal && selectedInstallation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowNotesModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="rounded-2xl p-8 max-w-md w-full shadow-2xl border"
                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>Add Installation Notes</h3>
                                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Installation #{selectedInstallation.id}</p>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add your notes about this installation..."
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors resize-none mb-6"
                                    style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--text-color)' }}
                                ></textarea>
                                <div className="flex gap-3">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold transition-colors"
                                        style={{ background: 'var(--glass-surface)', color: 'var(--text-secondary)' }}
                                        onClick={() => { setShowNotesModal(false); setNotes(''); }}>
                                        Cancel
                                    </motion.button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow-lg transition-all"
                                        onClick={handleAddNotes}>
                                        Add Note
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

export default TechnicianTracker;