import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, ArrowUp, ArrowDown, Plus, Edit2, Trash2, Save,
    RefreshCw, CheckCircle2, AlertCircle, X, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClans } from '../context/ClanContext';
import styles from '@/css/ManageClans.module.css';

const ManageClans = () => {
    const { token } = useAuth();
    const { refreshClans } = useClans();

    const [clansList, setClansList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingOrder, setSavingOrder] = useState(false);
    const [orderDirty, setOrderDirty] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    // Modals
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        tag: '',
        name: '',
        description: '',
        clanLevel: 10,
        type: 'open',
        clanType: 'FWA',
        requiredTownhallLevel: 12
    });
    const [selectedClan, setSelectedClan] = useState(null);

    // Fetch clan list
    const fetchClans = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/clans', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.clans) {
                setClansList(data.clans);
                setOrderDirty(false);
            }
        } catch (err) {
            console.error('Failed to load clans:', err);
            showFeedback('Failed to load clan list', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClans();
    }, []);

    const showFeedback = (message, type = 'success') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
    };

    // Move clan up in order
    const moveClan = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= clansList.length) return;

        const updated = [...clansList];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        setClansList(updated);
        setOrderDirty(true);
    };

    // Save Reordered List
    const handleSaveOrder = async () => {
        setSavingOrder(true);
        try {
            const orderedTags = clansList.map(c => c.tag || c._id);
            const res = await fetch('/api/clans', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action: 'reorder', orderedTags })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update order');

            setOrderDirty(false);
            showFeedback('Clan display order updated successfully!');
            refreshClans(); // Update public context
        } catch (err) {
            showFeedback(err.message, 'error');
        } finally {
            setSavingOrder(false);
        }
    };

    // Add Clan
    const handleAddClan = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/clans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add clan');

            setAddModalOpen(false);
            setFormData({
                tag: '',
                name: '',
                description: '',
                clanLevel: 10,
                type: 'open',
                clanType: 'FWA',
                requiredTownhallLevel: 12
            });
            showFeedback(`Clan ${data.clan.name} added successfully!`);
            fetchClans();
            refreshClans();
        } catch (err) {
            showFeedback(err.message, 'error');
        }
    };

    // Open Edit Modal
    const openEdit = (clan) => {
        setSelectedClan(clan);
        setFormData({
            tag: clan.tag || clan._id,
            name: clan.name || '',
            description: clan.description || '',
            clanLevel: clan.clanLevel || 1,
            type: clan.type || 'open',
            clanType: clan.clanType || 'FWA',
            requiredTownhallLevel: clan.requiredTownhallLevel || 1
        });
        setEditModalOpen(true);
    };

    // Save Edit Clan
    const handleEditClan = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/clans', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tag: selectedClan.tag || selectedClan._id,
                    ...formData
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update clan');

            setEditModalOpen(false);
            showFeedback('Clan details updated successfully!');
            fetchClans();
            refreshClans();
        } catch (err) {
            showFeedback(err.message, 'error');
        }
    };

    // Delete Clan
    const handleDeleteClan = async () => {
        if (!selectedClan) return;
        try {
            const clanTag = selectedClan.tag || selectedClan._id;
            const res = await fetch(`/api/clans?tag=${encodeURIComponent(clanTag)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to remove clan');

            setDeleteModalOpen(false);
            showFeedback('Clan removed successfully');
            fetchClans();
            refreshClans();
        } catch (err) {
            showFeedback(err.message, 'error');
        }
    };

    return (
        <div className={styles.managePage}>
            <div className="container">
                {/* Header */}
                <div className={styles.headerRow}>
                    <div className={styles.headerText}>
                        <h1 className={styles.title}>
                            <Layers size={24} style={{ color: 'var(--rh-red)' }} />
                            Manage Clan List & Order
                        </h1>
                        <p className={styles.subtitle}>
                            Control alliance clans, adjust their display sequence, and manage clan registry records
                        </p>
                    </div>

                    <div className={styles.headerActions}>
                        {orderDirty && (
                            <button
                                onClick={handleSaveOrder}
                                className="btn btn-primary"
                                disabled={savingOrder}
                            >
                                <Save size={16} style={{ marginRight: 6 }} />
                                {savingOrder ? 'Saving...' : 'Save Order Changes'}
                            </button>
                        )}

                        <button
                            onClick={fetchClans}
                            className="btn btn-secondary"
                            title="Refresh clan list"
                        >
                            <RefreshCw size={15} style={{ marginRight: 6 }} />
                            Refresh
                        </button>

                        <button
                            onClick={() => setAddModalOpen(true)}
                            className="btn btn-primary"
                        >
                            <Plus size={16} style={{ marginRight: 6 }} />
                            Add Clan
                        </button>
                    </div>
                </div>

                {/* Feedback Alert */}
                {feedback.message && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '3px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8125rem',
                            backgroundColor: feedback.type === 'error' ? 'rgba(238, 0, 0, 0.15)' : 'rgba(0, 180, 50, 0.15)',
                            border: `1px solid ${feedback.type === 'error' ? 'var(--rh-red)' : '#00b432'}`,
                            color: feedback.type === 'error' ? '#ff6b6b' : '#4ade80'
                        }}
                    >
                        {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                        <span>{feedback.message}</span>
                    </motion.div>
                )}

                {/* Stats Bar */}
                <div className={styles.statsBar}>
                    <div className={styles.statCard}>
                        <span className={styles.statVal}>{clansList.length}</span>
                        <span className={styles.statLbl}>Registered Clans</span>
                    </div>
                    {orderDirty && (
                        <div className={styles.statCard} style={{ borderColor: 'var(--rh-red)' }}>
                            <span className={styles.statVal} style={{ color: 'var(--rh-red)', fontSize: '0.9rem' }}>
                                Unsaved Changes
                            </span>
                            <span className={styles.statLbl}>Click "Save Order Changes"</span>
                        </div>
                    )}
                </div>

                {/* Clan List Table */}
                <div className={styles.tableCard}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: 70 }}>Order</th>
                                    <th>Clan</th>
                                    <th style={{ width: 110 }}>Clan Type</th>
                                    <th>Level</th>
                                    <th>Join Type</th>
                                    <th>Required TH</th>
                                    <th>Members</th>
                                    <th style={{ textAlign: 'center', width: 120 }}>Sequence</th>
                                    <th style={{ textAlign: 'right', width: 150 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                                            Loading clans...
                                        </td>
                                    </tr>
                                ) : clansList.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                                            No clans found. Click "Add Clan" to add one.
                                        </td>
                                    </tr>
                                ) : (
                                    clansList.map((clan, idx) => (
                                        <tr key={clan.tag || clan._id || idx}>
                                            <td>
                                                <span className={styles.orderBadge}>
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.clanIdentity}>
                                                    <img
                                                        src={clan.badgeUrls?.small || clan.badgeUrls?.medium || 'https://api-assets.clashofclans.com/badges/70/4eWfNqf2rN1E0k0gQ2F5t-hF9U2G_h1l3X9K7w2A5A.png'}
                                                        alt={clan.name}
                                                        className={styles.badgeImg}
                                                    />
                                                    <div>
                                                        <div className={styles.clanName}>{clan.name}</div>
                                                        <div className={styles.clanTag}>{clan.tag || clan._id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={clan.clanType === 'WAR' ? styles.typeBadgeWar : styles.typeBadgeFwa}>
                                                    {clan.clanType || 'FWA'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="mono">Lvl {clan.clanLevel || 1}</span>
                                            </td>
                                            <td style={{ textTransform: 'capitalize' }}>
                                                {clan.type || 'Open'}
                                            </td>
                                            <td>
                                                <span className="mono">TH {clan.requiredTownhallLevel || 1}+</span>
                                            </td>
                                            <td>
                                                <span className="mono">{clan.members || (clan.memberList ? clan.memberList.length : 0)}/50</span>
                                            </td>
                                            <td>
                                                <div className={styles.reorderBtns}>
                                                    <button
                                                        type="button"
                                                        className={styles.reorderBtn}
                                                        onClick={() => moveClan(idx, -1)}
                                                        disabled={idx === 0}
                                                        title="Move Up"
                                                    >
                                                        <ArrowUp size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles.reorderBtn}
                                                        onClick={() => moveClan(idx, 1)}
                                                        disabled={idx === clansList.length - 1}
                                                        title="Move Down"
                                                    >
                                                        <ArrowDown size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className={styles.actionBtns} style={{ justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => openEdit(clan)}
                                                        className={styles.actionBtn}
                                                        title="Edit clan details"
                                                    >
                                                        <Edit2 size={13} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedClan(clan);
                                                            setDeleteModalOpen(true);
                                                        }}
                                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                        title="Remove clan"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ADD CLAN MODAL */}
            <AnimatePresence>
                {addModalOpen && (
                    <div className={styles.modalBackdrop}>
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>Add Clan to Alliance</h2>
                                <button className={styles.closeBtn} onClick={() => setAddModalOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleAddClan}>
                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.modalLabel}>Clan Tag</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="#2L80LY0CP"
                                            className={styles.modalInput}
                                            value={formData.tag}
                                            onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.modalLabel}>Clan Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Clan Name"
                                            className={styles.modalInput}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.modalLabel}>Clan Level</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className={styles.modalInput}
                                            value={formData.clanLevel}
                                            onChange={(e) => setFormData({ ...formData, clanLevel: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.modalLabel}>Join Type</label>
                                        <select
                                            className={styles.modalInput}
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="open">Open</option>
                                            <option value="inviteOnly">Invite Only</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.modalLabel}>Clan Type</label>
                                        <select
                                            className={styles.modalInput}
                                            value={formData.clanType || 'FWA'}
                                            onChange={(e) => setFormData({ ...formData, clanType: e.target.value })}
                                        >
                                            <option value="FWA">FWA</option>
                                            <option value="WAR">WAR</option>
                                        </select>
                                    </div>
                                    <div className={`${styles.inputGroup} ${styles.fullCol}`}>
                                        <label className={styles.modalLabel}>Required Town Hall Level</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="17"
                                            className={styles.modalInput}
                                            value={formData.requiredTownhallLevel}
                                            onChange={(e) => setFormData({ ...formData, requiredTownhallLevel: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className={`${styles.inputGroup} ${styles.fullCol}`}>
                                        <label className={styles.modalLabel}>Description</label>
                                        <textarea
                                            rows="3"
                                            className={styles.modalInput}
                                            placeholder="Clan rules, CWL requirements..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className={styles.modalActions}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setAddModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Add Clan
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* EDIT CLAN MODAL */}
            <AnimatePresence>
                {editModalOpen && (
                    <div className={styles.modalBackdrop}>
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle}>Edit Clan: {formData.name}</h2>
                                <button className={styles.closeBtn} onClick={() => setEditModalOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleEditClan}>
                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.modalLabel}>Clan Tag (Read Only)</label>
                                        <input
                                            type="text"
                                            disabled
                                            className={styles.modalInput}
                                            value={formData.tag}
                                            style={{ opacity: 0.6 }}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.modalLabel}>Clan Name</label>
                                        <input
                                            type="text"
                                            required
                                            className={styles.modalInput}
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.modalLabel}>Clan Level</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className={styles.modalInput}
                                            value={formData.clanLevel}
                                            onChange={(e) => setFormData({ ...formData, clanLevel: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.modalLabel}>Join Type</label>
                                        <select
                                            className={styles.modalInput}
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="open">Open</option>
                                            <option value="inviteOnly">Invite Only</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.modalLabel}>Clan Type</label>
                                        <select
                                            className={styles.modalInput}
                                            value={formData.clanType || 'FWA'}
                                            onChange={(e) => setFormData({ ...formData, clanType: e.target.value })}
                                        >
                                            <option value="FWA">FWA</option>
                                            <option value="WAR">WAR</option>
                                        </select>
                                    </div>
                                    <div className={`${styles.inputGroup} ${styles.fullCol}`}>
                                        <label className={styles.modalLabel}>Required Town Hall Level</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="17"
                                            className={styles.modalInput}
                                            value={formData.requiredTownhallLevel}
                                            onChange={(e) => setFormData({ ...formData, requiredTownhallLevel: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className={`${styles.inputGroup} ${styles.fullCol}`}>
                                        <label className={styles.modalLabel}>Description</label>
                                        <textarea
                                            rows="3"
                                            className={styles.modalInput}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className={styles.modalActions}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setEditModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DELETE CLAN CONFIRMATION MODAL */}
            <AnimatePresence>
                {deleteModalOpen && selectedClan && (
                    <div className={styles.modalBackdrop}>
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{ maxWidth: 420 }}
                        >
                            <div className={styles.modalHeader}>
                                <h2 className={styles.modalTitle} style={{ color: 'var(--rh-red)' }}>
                                    Remove Clan
                                </h2>
                                <button className={styles.closeBtn} onClick={() => setDeleteModalOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                                Are you sure you want to remove <strong>{selectedClan.name}</strong> ({selectedClan.tag || selectedClan._id}) from the alliance registry?
                            </p>
                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setDeleteModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleDeleteClan}
                                >
                                    Confirm Remove
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageClans;
