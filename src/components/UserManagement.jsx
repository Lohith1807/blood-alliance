import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, UserPlus, Edit2, Trash2, Shield, User, RefreshCw,
    AlertCircle, CheckCircle2, X, Lock, Mail, Eye, EyeOff, KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from '@/css/UserManagement.module.css';

const UserManagement = () => {
    const { token, user: currentUser, isOwner } = useAuth();

    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    // Add User Form
    const [createForm, setCreateForm] = useState({
        email: '',
        password: '',
        role: 'mod',
        canViewLogs: false
    });
    const [showCreatePassword, setShowCreatePassword] = useState(false);

    // Edit Modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        id: '',
        email: '',
        role: 'mod',
        password: '',
        canViewLogs: false
    });
    const [showEditPassword, setShowEditPassword] = useState(false);

    // Delete Modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.users) {
                setUsersList(data.users);
            }
        } catch (err) {
            console.error('Failed to load users:', err);
            showFeedback('Failed to load users list', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showFeedback = (message, type = 'success') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
    };

    // Add User Handler
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(createForm)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create user');

            setCreateForm({ email: '', password: '', role: 'mod' });
            showFeedback(`User ${data.user.email} created successfully as ${data.user.role.toUpperCase()}`);
            fetchUsers();
        } catch (err) {
            showFeedback(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Open Edit Modal
    const openEditModal = (u) => {
        setEditForm({
            id: u.id,
            email: u.email,
            role: u.role,
            password: '',
            canViewLogs: Boolean(u.canViewLogs)
        });
        setEditModalOpen(true);
    };

    // Save Edit User Handler
    const handleEditUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                id: editForm.id,
                email: editForm.email,
                role: editForm.role,
                canViewLogs: editForm.canViewLogs
            };
            if (editForm.password) {
                payload.password = editForm.password;
            }

            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update user');

            setEditModalOpen(false);
            showFeedback(`User ${data.user.email} updated successfully`);
            fetchUsers();
        } catch (err) {
            showFeedback(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Delete User Handler
    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        setSubmitting(true);

        try {
            const res = await fetch(`/api/users?id=${encodeURIComponent(userToDelete.id)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete user');

            setDeleteModalOpen(false);
            showFeedback(`User ${userToDelete.email} removed successfully`);
            fetchUsers();
        } catch (err) {
            showFeedback(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const adminCount = usersList.filter(u => u.role === 'admin').length;

    return (
        <div className={styles.userPage}>
            <div className="container">
                {/* Header */}
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>
                            <Users size={24} style={{ color: 'var(--rh-red)' }} />
                            User Management
                            <span style={{
                                fontSize: '0.7rem',
                                padding: '0.2rem 0.5rem',
                                background: 'rgba(238, 0, 0, 0.15)',
                                border: '1px solid var(--rh-red)',
                                color: 'var(--rh-red)',
                                borderRadius: 2,
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                fontFamily: 'JetBrains Mono'
                            }}>
                                ADMIN ONLY
                            </span>
                        </h1>
                        <p className={styles.subtitle}>
                            Create, update, and manage administrator and moderator credentials with role-based access control
                        </p>
                    </div>

                    <button onClick={fetchUsers} className="btn btn-secondary">
                        <RefreshCw size={15} style={{ marginRight: 6 }} /> Refresh
                    </button>
                </div>

                {/* Feedback Notification */}
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

                {/* Main Content Layout */}
                <div className={styles.layoutGrid}>
                    {/* LEFT: Add User Form */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>
                            <UserPlus size={18} style={{ color: 'var(--rh-red)' }} />
                            Add New User
                        </h2>

                        <form onSubmit={handleCreateUser}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="create-email">
                                    Email Address
                                </label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Mail size={15} style={{ position: 'absolute', left: 10, color: 'var(--text-muted)' }} />
                                    <input
                                        id="create-email"
                                        type="email"
                                        required
                                        placeholder="user@bloodalliance.com"
                                        className={styles.input}
                                        style={{ paddingLeft: '2.1rem' }}
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="create-password">
                                    Password
                                </label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Lock size={15} style={{ position: 'absolute', left: 10, color: 'var(--text-muted)' }} />
                                    <input
                                        id="create-password"
                                        type={showCreatePassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        placeholder="Min. 6 characters"
                                        className={styles.input}
                                        style={{ paddingLeft: '2.1rem', paddingRight: '2.2rem' }}
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                        disabled={submitting}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                                        style={{
                                            position: 'absolute', right: 10, background: 'none',
                                            border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0
                                        }}
                                    >
                                        {showCreatePassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    Assigned Role
                                </label>
                                <select
                                    className={styles.input}
                                    value={createForm.role}
                                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                                    disabled={submitting}
                                >
                                    <option value="mod">Mod (Moderator - Clans & Tickets)</option>
                                    <option value="admin">Admin (Full Access & User Management)</option>
                                </select>
                            </div>

                            {isOwner && (
                                <div style={{
                                    marginBottom: '1rem',
                                    padding: '0.65rem 0.75rem',
                                    background: 'rgba(251, 191, 36, 0.06)',
                                    border: '1px solid rgba(251, 191, 36, 0.2)',
                                    borderRadius: 3
                                }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                                        <input
                                            type="checkbox"
                                            checked={createForm.canViewLogs || false}
                                            onChange={(e) => setCreateForm({ ...createForm, canViewLogs: e.target.checked })}
                                            disabled={submitting}
                                            style={{ accentColor: '#fbbf24' }}
                                        />
                                        <span>Grant access to view Audit & Activity Logs</span>
                                    </label>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', height: 40, marginTop: '0.75rem' }}
                                disabled={submitting}
                            >
                                <UserPlus size={16} style={{ marginRight: 6 }} />
                                {submitting ? 'Creating User...' : 'Create User'}
                            </button>
                        </form>
                    </div>

                    {/* RIGHT: User List Table */}
                    <div className={styles.tableCard}>
                        <div style={{
                            padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                Registered Accounts ({usersList.length})
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                                {adminCount} Admin{adminCount !== 1 ? 's' : ''} • {usersList.length - adminCount} Mod{usersList.length - adminCount !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Email Address</th>
                                        <th>Role</th>
                                        <th>Created Date</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                                                Loading user accounts...
                                            </td>
                                        </tr>
                                    ) : usersList.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                                                No users registered yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        usersList.map((u) => {
                                            const isCurrentUser = currentUser?.email?.toLowerCase() === u.email?.toLowerCase();
                                            const isSoleAdmin = u.role === 'admin' && adminCount <= 1;

                                            return (
                                                <tr key={u.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                                {u.email}
                                                            </span>
                                                            {isCurrentUser && (
                                                                <span style={{
                                                                    fontSize: '0.68rem', padding: '1px 5px',
                                                                    background: '#2b2b2b', color: 'var(--text-muted)',
                                                                    borderRadius: 2, fontFamily: 'JetBrains Mono'
                                                                }}>
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                                            <span className={`${styles.roleBadge} ${
                                                                u.email?.toLowerCase() === 'lohithreddy1819@gmail.com' ? styles.roleAdmin :
                                                                u.role === 'admin' ? styles.roleAdmin : styles.roleMod
                                                            }`} style={u.email?.toLowerCase() === 'lohithreddy1819@gmail.com' ? { background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' } : {}}>
                                                                {u.email?.toLowerCase() === 'lohithreddy1819@gmail.com' ? 'OWNER' : u.role?.toUpperCase()}
                                                            </span>
                                                            {u.canViewLogs && u.email?.toLowerCase() !== 'lohithreddy1819@gmail.com' && (
                                                                <span style={{
                                                                    fontSize: '0.62rem',
                                                                    padding: '1px 5px',
                                                                    background: 'rgba(251, 191, 36, 0.15)',
                                                                    color: '#fbbf24',
                                                                    borderRadius: 2,
                                                                    fontFamily: 'JetBrains Mono',
                                                                    fontWeight: 700
                                                                }}>
                                                                    LOGS
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div className={styles.actionBtns} style={{ justifyContent: 'flex-end' }}>
                                                            <button
                                                                onClick={() => openEditModal(u)}
                                                                className={styles.actionBtn}
                                                                title="Edit user details"
                                                            >
                                                                <Edit2 size={13} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setUserToDelete(u);
                                                                    setDeleteModalOpen(true);
                                                                }}
                                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                                title={u.email?.toLowerCase() === 'lohithreddy1819@gmail.com' ? 'Cannot delete Alliance Owner' : isSoleAdmin ? 'Cannot delete the sole admin' : 'Delete user'}
                                                                disabled={isSoleAdmin || u.email?.toLowerCase() === 'lohithreddy1819@gmail.com'}
                                                                style={{ opacity: (isSoleAdmin || u.email?.toLowerCase() === 'lohithreddy1819@gmail.com') ? 0.3 : 1 }}
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* EDIT USER MODAL */}
            <AnimatePresence>
                {editModalOpen && (
                    <div className={styles.modalBackdrop}>
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    Edit User Details
                                </h2>
                                <button
                                    onClick={() => setEditModalOpen(false)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleEditUser}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label className={styles.label}>Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className={styles.input}
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div>
                                        <label className={styles.label}>Role</label>
                                        <select
                                            className={styles.input}
                                            value={editForm.role}
                                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                            disabled={submitting}
                                        >
                                            <option value="mod">Mod (Moderator)</option>
                                            <option value="admin">Admin (Administrator)</option>
                                        </select>
                                        {editForm.role !== 'admin' && adminCount <= 1 && usersList.find(u => u.id === editForm.id)?.role === 'admin' && (
                                            <small style={{ color: '#ff6b6b', display: 'block', marginTop: 4 }}>
                                                Notice: Demoting the only admin is not allowed.
                                            </small>
                                        )}
                                    </div>

                                    <div>
                                        <label className={styles.label}>
                                            Reset / Update Password (Optional)
                                        </label>
                                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                            <KeyRound size={15} style={{ position: 'absolute', left: 10, color: 'var(--text-muted)' }} />
                                            <input
                                                type={showEditPassword ? 'text' : 'password'}
                                                minLength={6}
                                                placeholder="Leave blank to keep existing password"
                                                className={styles.input}
                                                style={{ paddingLeft: '2.1rem', paddingRight: '2.2rem' }}
                                                value={editForm.password}
                                                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                                disabled={submitting}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowEditPassword(!showEditPassword)}
                                                style={{
                                                    position: 'absolute', right: 10, background: 'none',
                                                    border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0
                                                }}
                                            >
                                                {showEditPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    {isOwner && (
                                        <div style={{
                                            padding: '0.65rem 0.75rem',
                                            background: 'rgba(251, 191, 36, 0.06)',
                                            border: '1px solid rgba(251, 191, 36, 0.2)',
                                            borderRadius: 3
                                        }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={editForm.canViewLogs || false}
                                                    onChange={(e) => setEditForm({ ...editForm, canViewLogs: e.target.checked })}
                                                    disabled={submitting}
                                                    style={{ accentColor: '#fbbf24' }}
                                                />
                                                <span>Grant access to view Audit & Activity Logs</span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setEditModalOpen(false)}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DELETE USER CONFIRMATION MODAL */}
            <AnimatePresence>
                {deleteModalOpen && userToDelete && (
                    <div className={styles.modalBackdrop}>
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{ maxWidth: 420 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--rh-red)' }}>
                                    Delete User
                                </h2>
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                                Are you sure you want to permanently delete account <strong>{userToDelete.email}</strong>? This user will immediately lose access and have their session terminated.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setDeleteModalOpen(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleDeleteUser}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Deleting...' : 'Confirm Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
