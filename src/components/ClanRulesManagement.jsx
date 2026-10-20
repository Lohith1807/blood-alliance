import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Plus, Trash2, CheckCircle2, AlertCircle, Save,
    Shield, RefreshCw, Layers, Award, Users, Crown, Star,
    ExternalLink, Sparkles, Hash, X, Maximize2, Check, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from '@/css/ClanRulesManagement.module.css';

const ClanRulesManagement = () => {
    const { token, user } = useAuth();

    const [clans, setClans] = useState([]);
    const [selectedTag, setSelectedTag] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '{clanName} Rules',
        color: '#E74C3C',
        image: '',
        thumbnail: '',
        footer: { text: '', iconURL: '' },
        rules: []
    });
    const [newRuleText, setNewRuleText] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    const fetchClanRules = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/clan-rules', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.clans) {
                // Ensure clans are sorted in order
                const sortedClans = [...data.clans].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
                setClans(sortedClans);

                // If currently open clan is in the list, keep formData synced
                if (selectedTag) {
                    const currentClan = sortedClans.find(c => c.tag === selectedTag);
                    if (currentClan) {
                        setFormData({
                            title: currentClan.title || `${currentClan.name} Rules`,
                            color: currentClan.color || '#E74C3C',
                            image: currentClan.image || '',
                            thumbnail: currentClan.thumbnail || currentClan.badgeUrls?.large || currentClan.badgeUrls?.medium || '',
                            footer: currentClan.footer || { text: '', iconURL: '' },
                            rules: Array.isArray(currentClan.rules) ? currentClan.rules : []
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load clan rules:', err);
            showFeedback('Failed to load clan rules from bot server', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClanRules();
    }, []);

    // Listen for Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                setIsModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    // Prevent background scrolling when full-screen modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

    const showFeedback = (message, type = 'success') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
    };

    // Open clan editor in full-screen modal
    const handleOpenClanModal = (clan) => {
        setSelectedTag(clan.tag);
        setFormData({
            title: clan.title || `${clan.name} Rules`,
            color: clan.color || '#E74C3C',
            image: clan.image || '',
            thumbnail: clan.thumbnail || clan.badgeUrls?.large || clan.badgeUrls?.medium || '',
            footer: clan.footer || { text: '', iconURL: '' },
            rules: Array.isArray(clan.rules) ? clan.rules : []
        });
        setNewRuleText('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Quick helper to auto-fill clan badge as thumbnail
    const handleUseClanBadge = () => {
        if (!selectedClan) return;
        const badge = selectedClan.badgeUrls?.large || selectedClan.badgeUrls?.medium || selectedClan.badgeUrls?.small;
        if (badge) {
            setFormData({ ...formData, thumbnail: badge });
        }
    };

    // Rule operations
    const handleAddRule = (e) => {
        e.preventDefault();
        const trimmed = newRuleText.trim();
        if (!trimmed) return;

        setFormData({
            ...formData,
            rules: [...formData.rules, trimmed]
        });
        setNewRuleText('');
    };

    const handleUpdateRule = (index, text) => {
        const next = [...formData.rules];
        next[index] = text;
        setFormData({ ...formData, rules: next });
    };

    const handleDeleteRule = (index) => {
        const next = [...formData.rules];
        next.splice(index, 1);
        setFormData({ ...formData, rules: next });
    };

    // Save rules to API endpoint (clashbot + MongoDB)
    const handleSave = async () => {
        if (!selectedTag) return;
        setSaving(true);

        try {
            const res = await fetch('/api/clan-rules', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tag: selectedTag,
                    ...formData
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update rules on bot server');

            showFeedback(data.message || 'Clan rules and embed updated on Clash Bot server!');
            // Refresh clans list to update rules count on the cards
            fetchClanRules();
        } catch (err) {
            showFeedback(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const selectedClan = clans.find(c => c.tag === selectedTag);
    const resolvedTitle = (formData.title || '{clanName} Rules').replace('{clanName}', selectedClan?.name || 'Clan');
    const accessiblePeople = selectedClan?.accessibleUsers || [];

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>
                            <FileText size={26} style={{ color: 'var(--rh-red)' }} />
                            Discord Clan Rules Embed Manager
                        </h1>
                        <p className={styles.subtitle}>
                            Manage rule protocols and live Discord embeds for alliance clans.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                            onClick={fetchClanRules}
                            className="btn btn-secondary"
                            disabled={loading || saving}
                            style={{ height: 38 }}
                        >
                            <RefreshCw size={14} style={{ marginRight: 6 }} className={loading ? 'spin' : ''} /> Refresh
                        </button>
                    </div>
                </div>

                {feedback.message && !isModalOpen && (
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

                {/* 1. LIST OF CLANS IN ORDER */}
                <div>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitle}>
                            <Layers size={15} style={{ color: 'var(--rh-red)' }} />
                            Alliance Clans in Order ({clans.length})
                        </div>
                    </div>

                    {clans.length > 0 ? (
                        <div className={styles.clansGrid}>
                            {clans.map((clan, idx) => {
                                const badge = clan.badgeUrls?.small || clan.badgeUrls?.medium;
                                const rulesCount = Array.isArray(clan.rules) ? clan.rules.length : 0;
                                const managersCount = Array.isArray(clan.accessibleUsers) ? clan.accessibleUsers.length : 0;
                                const orderNum = (clan.order !== undefined ? clan.order + 1 : idx + 1);

                                return (
                                    <div
                                        key={clan.tag}
                                        onClick={() => handleOpenClanModal(clan)}
                                        className={styles.clanCard}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                handleOpenClanModal(clan);
                                            }
                                        }}
                                    >
                                        <div className={styles.rankBadge}>
                                            #{orderNum}
                                        </div>

                                        {badge ? (
                                            <img src={badge} alt={clan.name} className={styles.clanBadgeImg} />
                                        ) : (
                                            <Award size={38} style={{ color: 'var(--rh-red)', flexShrink: 0 }} />
                                        )}

                                        <div className={styles.clanInfo}>
                                            <div className={styles.clanName} title={clan.name}>
                                                {clan.name}
                                            </div>
                                            <div className={styles.clanTag}>{clan.tag}</div>

                                            <div className={styles.clanMeta}>
                                                <span className={styles.rulesCountBadge}>
                                                    {rulesCount === 1 ? '1 Rule' : `${rulesCount} Rules`}
                                                </span>
                                                <span className={styles.managersBadge}>
                                                    {managersCount} Manager{managersCount === 1 ? '' : 's'}
                                                </span>
                                                {clan.clanLevel && (
                                                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                                                        Lvl {clan.clanLevel}
                                                    </span>
                                                )}
                                            </div>

                                            <div className={styles.editOverlayHint}>
                                                <Maximize2 size={12} />
                                                <span>Click to edit rules</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : !loading && (
                        <div className={styles.emptyCard}>
                            <Shield size={38} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Clans Assigned</h3>
                            <p style={{ maxWidth: 450, margin: '0 auto', fontSize: '0.85rem' }}>
                                Your account currently does not have access to manage any clans. Please ask an Alliance Admin or Owner to assign clans to your account in User Management.
                            </p>
                        </div>
                    )}
                </div>

                {/* 2. FULL SCREEN POPUP MODAL (Portaled to body to prevent stacking context clipping) */}
                {typeof document !== 'undefined' && createPortal(
                    <AnimatePresence>
                        {isModalOpen && selectedClan && (
                            <div
                                className={styles.modalBackdrop}
                                onClick={handleCloseModal}
                            >
                                <motion.div
                                    className={styles.modalContainer}
                                    onClick={(e) => e.stopPropagation()}
                                    initial={{ opacity: 0, scale: 0.99 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.99 }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                >
                                    {/* MODAL HEADER */}
                                    <div className={styles.modalHeader}>
                                        <div className={styles.modalHeaderInner}>
                                            <div className={styles.modalHeaderLeft}>
                                                {selectedClan.badgeUrls?.medium || selectedClan.badgeUrls?.small ? (
                                                    <img
                                                        src={selectedClan.badgeUrls?.medium || selectedClan.badgeUrls?.small}
                                                        alt={selectedClan.name}
                                                        className={styles.modalClanBadge}
                                                    />
                                                ) : (
                                                    <Award size={34} style={{ color: 'var(--rh-red)' }} />
                                                )}
                                                <div className={styles.modalClanInfo}>
                                                    <div className={styles.modalClanTitle}>
                                                        {selectedClan.name}
                                                        <span className={styles.rankBadge} style={{ position: 'static' }}>
                                                            #{selectedClan.order !== undefined ? selectedClan.order + 1 : 1}
                                                        </span>
                                                    </div>
                                                    <div className={styles.modalClanTag}>
                                                        {selectedClan.tag}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <button
                                                    onClick={handleSave}
                                                    className={`btn btn-primary ${styles.saveBtnHeader}`}
                                                    disabled={saving}
                                                >
                                                    <Save size={15} style={{ marginRight: 6 }} />
                                                    <span className={styles.saveBtnFullText}>{saving ? 'Saving...' : 'Save Changes'}</span>
                                                    <span className={styles.saveBtnShortText}>{saving ? '...' : 'Save'}</span>
                                                </button>
                                                <button
                                                    onClick={handleCloseModal}
                                                    className={styles.modalCloseBtn}
                                                    title="Close (Esc)"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* MODAL SCROLL AREA */}
                                    <div className={styles.modalScrollArea}>
                                        <div className={styles.modalInnerContent}>
                                            {feedback.message && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        borderRadius: '4px',
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

                                            {/* SECTION A: PEOPLE WHO HAVE ACCESS TO THIS CLAN */}
                                            <div className={styles.peopleCard}>
                                                <div className={styles.peopleHeader}>
                                                    <div className={styles.peopleTitle}>
                                                        <Users size={16} style={{ color: '#c084fc' }} />
                                                        People with Access to Manage {selectedClan.name}
                                                    </div>
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                                                        {accessiblePeople.length} Authorized Manager{accessiblePeople.length === 1 ? '' : 's'}
                                                    </span>
                                                </div>

                                                {accessiblePeople.length === 0 ? (
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                        No specific managers assigned. Alliance Owner and Admins have global access.
                                                    </div>
                                                ) : (
                                                    <div className={styles.peopleGrid}>
                                                        {accessiblePeople.map((person) => {
                                                            const initial = (person.email?.[0] || 'U').toUpperCase();
                                                            const isUserOwner = person.isOwner || person.email?.toLowerCase() === 'lohithreddy1819@gmail.com';
                                                            const isLeader = person.role === 'leader';
                                                            const isAdmin = person.role === 'admin';

                                                            return (
                                                                <div key={person.id} className={styles.personChip}>
                                                                    <div className={styles.personAvatar}>
                                                                        {isUserOwner ? <Crown size={12} style={{ color: '#fbbf24' }} /> : initial}
                                                                    </div>
                                                                    <span className={styles.personEmail}>
                                                                        {person.email}
                                                                    </span>
                                                                    <span className={`${styles.personBadge} ${
                                                                        isUserOwner ? styles.badgeOwner :
                                                                        isAdmin ? styles.badgeAdmin :
                                                                        styles.badgeLeader
                                                                    }`}>
                                                                        {isUserOwner ? 'OWNER' : isAdmin ? 'ADMIN' : 'LEADER'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* SECTION B: EMBED EDITOR & LIVE DISCORD EMBED PREVIEW */}
                                            <div className={styles.mainLayout}>
                                                {/* LEFT: EMBED EDITOR */}
                                                <div className={styles.editorCard}>
                                                    <div className={styles.editorHeader}>
                                                        <div className={styles.editorTitle}>
                                                            <FileText size={18} style={{ color: 'var(--rh-red)' }} />
                                                            Discord Embed Settings
                                                        </div>
                                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                            Live Embed Editor
                                                        </span>
                                                    </div>

                                                    <div className={styles.editorBody}>
                                                        {/* Meta Fields */}
                                                        <div className={styles.configGrid}>
                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Embed Title</label>
                                                                <input
                                                                    type="text"
                                                                    className={styles.input}
                                                                    value={formData.title}
                                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                                    placeholder="{clanName} Rules"
                                                                />
                                                                <small style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                                                    <code>{'{clanName}'}</code> will be replaced with {selectedClan.name}.
                                                                </small>
                                                            </div>

                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Embed Accent Color</label>
                                                                <div className={styles.colorPickerRow}>
                                                                    <input
                                                                        type="color"
                                                                        className={styles.colorBox}
                                                                        value={formData.color || '#E74C3C'}
                                                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        className={styles.input}
                                                                        value={formData.color}
                                                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                                        placeholder="#E74C3C"
                                                                        style={{ fontFamily: 'JetBrains Mono' }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className={styles.formGroup}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <label className={styles.label}>Thumbnail URL (Icon)</label>
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleUseClanBadge}
                                                                        style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            color: '#60a5fa',
                                                                            fontSize: '0.68rem',
                                                                            cursor: 'pointer',
                                                                            padding: 0,
                                                                            fontFamily: 'JetBrains Mono'
                                                                        }}
                                                                    >
                                                                        Use Clan Badge
                                                                    </button>
                                                                </div>
                                                                <input
                                                                    type="url"
                                                                    className={styles.input}
                                                                    value={formData.thumbnail}
                                                                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                                                    placeholder="https://.../badge.png"
                                                                />
                                                            </div>

                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Banner Image URL (Optional)</label>
                                                                <input
                                                                    type="url"
                                                                    className={styles.input}
                                                                    value={formData.image}
                                                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                                    placeholder="https://.../banner.png"
                                                                />
                                                            </div>

                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Footer Text</label>
                                                                <input
                                                                    type="text"
                                                                    className={styles.input}
                                                                    value={formData.footer?.text || ''}
                                                                    onChange={(e) => setFormData({
                                                                        ...formData,
                                                                        footer: { ...(formData.footer || {}), text: e.target.value }
                                                                    })}
                                                                    placeholder="Blood Alliance • Clash of Clans"
                                                                />
                                                            </div>

                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Footer Icon URL</label>
                                                                <input
                                                                    type="url"
                                                                    className={styles.input}
                                                                    value={formData.footer?.iconURL || ''}
                                                                    onChange={(e) => setFormData({
                                                                        ...formData,
                                                                        footer: { ...(formData.footer || {}), iconURL: e.target.value }
                                                                    })}
                                                                    placeholder="https://.../icon.png"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* RULES LIST */}
                                                        <div className={styles.ruleListSection}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                                <label className={styles.label}>
                                                                    Clan Rules ({formData.rules.length} Items)
                                                                </label>
                                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                                    Numbered sequentially in Discord
                                                                </span>
                                                            </div>

                                                            <div className={styles.ruleList}>
                                                                {formData.rules.length === 0 ? (
                                                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                                        No rules entered for this clan yet. Add your first rule below.
                                                                    </div>
                                                                ) : (
                                                                    formData.rules.map((rule, idx) => (
                                                                        <div key={idx} className={styles.ruleItemRow}>
                                                                            <span className={styles.ruleNum}>
                                                                                {String(idx + 1).padStart(2, '0')}.
                                                                            </span>
                                                                            <input
                                                                                type="text"
                                                                                value={rule}
                                                                                onChange={(e) => handleUpdateRule(idx, e.target.value)}
                                                                                className={styles.ruleInput}
                                                                                placeholder="Enter clan rule instruction..."
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDeleteRule(idx)}
                                                                                className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                                                                                title="Delete rule"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>

                                                            {/* Add Rule Form */}
                                                            <form onSubmit={handleAddRule} className={styles.addRuleRow}>
                                                                <input
                                                                    type="text"
                                                                    value={newRuleText}
                                                                    onChange={(e) => setNewRuleText(e.target.value)}
                                                                    className={styles.addRuleInput}
                                                                    placeholder="Type a new rule and press Enter or click Add..."
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    className="btn btn-secondary"
                                                                    disabled={!newRuleText.trim()}
                                                                    style={{ height: 38, padding: '0 1rem' }}
                                                                >
                                                                    <Plus size={15} style={{ marginRight: 4 }} /> Add Rule
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* RIGHT: LIVE DISCORD EMBED PREVIEW */}
                                                <div className={styles.discordContainer}>
                                                    <div className={styles.discordHeader}>
                                                        <div className={styles.discordAvatar}>BA</div>
                                                        <div>
                                                            <div className={styles.discordBotName}>
                                                                <span>Blood Alliance Bot</span>
                                                                <span className={styles.discordBotBadge}>APP</span>
                                                            </div>
                                                            <span style={{ fontSize: '0.68rem', color: '#949ba4' }}>
                                                                Live Discord Embed Preview
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={styles.discordEmbed}
                                                        style={{ borderLeftColor: formData.color || '#E74C3C' }}
                                                    >
                                                        <div className={styles.discordEmbedTop}>
                                                            <div className={styles.discordEmbedTitle}>
                                                                {resolvedTitle}
                                                            </div>
                                                            {formData.thumbnail && (
                                                                <img
                                                                    src={formData.thumbnail}
                                                                    alt="Thumbnail"
                                                                    className={styles.discordThumbnail} referrerPolicy="no-referrer"
                                                                    onError={(e) => e.target.style.display = 'none'}
                                                                />
                                                            )}
                                                        </div>

                                                        <div className={styles.discordRulesList}>
                                                            {formData.rules.length === 0 ? (
                                                                <span style={{ fontStyle: 'italic', color: '#949ba4' }}>
                                                                    No rules configured yet.
                                                                </span>
                                                            ) : (
                                                                formData.rules.map((rule, idx) => (
                                                                    <div key={idx} className={styles.discordRuleRow}>
                                                                        <span className={styles.discordRuleBullet}>
                                                                            {idx + 1}.
                                                                        </span>
                                                                        <span>{rule}</span>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>

                                                        {formData.image && (
                                                            <img
                                                                src={formData.image}
                                                                alt="Banner"
                                                                className={styles.discordBanner} referrerPolicy="no-referrer"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        )}

                                                        {(formData.footer?.text || formData.footer?.iconURL) && (
                                                            <div className={styles.discordFooter}>
                                                                {formData.footer?.iconURL && (
                                                                    <img
                                                                        src={formData.footer.iconURL}
                                                                        alt="Footer icon"
                                                                        className={styles.discordFooterIcon}
                                                                        onError={(e) => e.target.style.display = 'none'}
                                                                    />
                                                                )}
                                                                <span>{formData.footer?.text || 'Blood Alliance'}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* MODAL FOOTER */}
                                    <div className={styles.modalFooter}>
                                        <div className={styles.modalFooterInner}>
                                            <div className={styles.modalFooterText}>
                                                <span>Discord Embed Rule Editor</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={handleCloseModal}
                                                    className="btn btn-secondary"
                                                    style={{ height: 38, padding: '0 1.25rem' }}
                                                >
                                                    Close
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSave}
                                                    className="btn btn-primary"
                                                    disabled={saving}
                                                    style={{ height: 38, padding: '0 1.5rem' }}
                                                >
                                                    <Save size={16} style={{ marginRight: 6 }} />
                                                    {saving ? 'Saving...' : 'Save Clan Rules'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </div>
        </div>
    );
};

export default ClanRulesManagement;
