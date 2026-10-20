import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Sliders, Shield, Lock, CheckCircle2, AlertCircle, RotateCcw,
    Layers, Ticket, Users, FileText, Check, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from '@/css/ModulePermissions.module.css';

const MODULE_ICONS = {
    'manage-clans': <Layers size={16} style={{ color: 'var(--rh-red)' }} />,
    'ticket-management': <Ticket size={16} style={{ color: '#60a5fa' }} />,
    'user-management': <Users size={16} style={{ color: '#f87171' }} />,
    'audit-logs': <Shield size={16} style={{ color: '#fbbf24' }} />,
    'clan-rules': <FileText size={16} style={{ color: '#c084fc' }} />,
    'module-permissions': <Sliders size={16} style={{ color: '#34d399' }} />
};

const DEFAULT_MATRIX = {
    'manage-clans': ['admin', 'mod'],
    'ticket-management': ['admin', 'mod', 'staff'],
    'user-management': ['admin'],
    'audit-logs': ['admin'],
    'clan-rules': ['admin', 'leader'],
    'module-permissions': ['admin']
};

const ModulePermissions = () => {
    const { token, isOwner, fetchPermissions } = useAuth();

    const [modules, setModules] = useState([]);
    const [permissions, setPermissions] = useState(DEFAULT_MATRIX);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    const roles = [
        { id: 'admin', label: 'Admin', badgeClass: styles.adminBadge },
        { id: 'mod', label: 'Mod', badgeClass: styles.modBadge },
        { id: 'staff', label: 'Staff', badgeClass: styles.staffBadge },
        { id: 'leader', label: 'Leader', badgeClass: styles.leaderBadge }
    ];

    const loadPermissions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/permissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.permissions) {
                setPermissions(data.permissions);
            }
            if (data.availableModules) {
                setModules(data.availableModules);
            }
        } catch (err) {
            console.error('Failed to load permissions:', err);
            showFeedback('Failed to load current permissions matrix', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPermissions();
    }, []);

    const showFeedback = (message, type = 'success') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback({ message: '', type: '' }), 6000);
    };

    const togglePermission = (modId, roleId) => {
        const currentRoles = permissions[modId] || [];
        const nextRoles = currentRoles.includes(roleId)
            ? currentRoles.filter(r => r !== roleId)
            : [...currentRoles, roleId];

        setPermissions({
            ...permissions,
            [modId]: nextRoles
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/permissions', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ permissions })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save permissions');

            // Trigger real-time refresh in AuthContext so Navbar and pages update instantly
            await fetchPermissions();

            showFeedback('Permissions matrix saved successfully. Access rules applied in real time!');
        } catch (err) {
            showFeedback(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleResetDefaults = () => {
        setPermissions(DEFAULT_MATRIX);
        showFeedback('Restored recommended default role matrix. Click "Save Permissions" to commit.', 'success');
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>
                            <Sliders size={24} style={{ color: 'var(--rh-red)' }} />
                            Alliance Module Permissions
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
                                RBAC CONTROL
                            </span>
                        </h1>
                        <p className={styles.subtitle}>
                            Configure role-based access control (RBAC). Changes take effect across user navigation and APIs in real-time.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                            onClick={handleResetDefaults}
                            className="btn btn-secondary"
                            disabled={saving}
                            style={{ height: 38 }}
                        >
                            <RotateCcw size={14} style={{ marginRight: 6 }} /> Reset Defaults
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn btn-primary"
                            disabled={saving}
                            style={{ height: 38 }}
                        >
                            <ShieldCheck size={16} style={{ marginRight: 6 }} />
                            {saving ? 'Saving Changes...' : 'Save Permissions'}
                        </button>
                    </div>
                </div>

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

                <div className={styles.card}>
                    <div className={styles.tableHeader}>
                        <div className={styles.tableTitle}>
                            <Lock size={16} style={{ color: 'var(--rh-red)' }} />
                            Role Permission Matrix
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Check the boxes below to grant a role permission to access and manage each module.
                        </span>
                    </div>

                    <div className={styles.tableResponsive}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ minWidth: 260 }}>Alliance Module</th>
                                    <th className={styles.roleColHeader} style={{ width: 110 }}>Owner</th>
                                    {roles.map(r => (
                                        <th key={r.id} className={styles.roleColHeader} style={{ width: 110 }}>
                                            <span className={`${styles.roleHeaderBadge} ${r.badgeClass}`}>
                                                {r.label}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                            Loading permissions matrix...
                                        </td>
                                    </tr>
                                ) : (
                                    modules.map(mod => {
                                        const allowedRoles = permissions[mod.id] || [];

                                        return (
                                            <tr key={mod.id}>
                                                <td>
                                                    <div className={styles.moduleInfo}>
                                                        <div className={styles.moduleName}>
                                                            {MODULE_ICONS[mod.id] || <Lock size={16} />}
                                                            <span>{mod.name}</span>
                                                        </div>
                                                        <span className={styles.moduleDesc}>
                                                            {mod.description}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Owner is always unlocked / granted */}
                                                <td className={styles.checkboxCell}>
                                                    <span className={styles.lockedOwner} title="Alliance Owner always has full access">
                                                        <Check size={12} /> FULL
                                                    </span>
                                                </td>

                                                {/* Role Toggles */}
                                                {roles.map(r => {
                                                    const isChecked = allowedRoles.includes(r.id);

                                                    return (
                                                        <td key={r.id} className={styles.checkboxCell}>
                                                            <label className={styles.toggleLabel}>
                                                                <input
                                                                    type="checkbox"
                                                                    className={styles.checkboxInput}
                                                                    checked={isChecked}
                                                                    onChange={() => togglePermission(mod.id, r.id)}
                                                                />
                                                            </label>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.saveBar}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            * Alliance Owner ({isOwner ? 'You' : 'Superadmin'}) inherently maintains full access to all endpoints regardless of matrix toggles.
                        </span>
                        <button
                            onClick={handleSave}
                            className="btn btn-primary"
                            disabled={saving}
                            style={{ height: 38 }}
                        >
                            <ShieldCheck size={16} style={{ marginRight: 6 }} />
                            {saving ? 'Saving Changes...' : 'Save Permissions'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModulePermissions;
