import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    Search,
    Shield,
    Users,
    Globe,
    Lock,
    Settings,
    X,
    Check,
    RefreshCw,
    Plus,
    AlertCircle,
    UserCheck,
    Layers,
    Save,
    ExternalLink,
    UserPlus,
    Tag,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from '@/css/CommandManagement.module.css';

// Helper to determine text brightness for contrast
function getContrastingColor(hexColor) {
    if (!hexColor || hexColor === '#000000') return '#94a3b8';
    const clean = hexColor.replace('#', '');
    if (clean.length !== 6) return hexColor;
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    // YIQ formula
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq < 70 ? '#cbd5e1' : hexColor;
}

// Convert hex to rgba
function hexToRgba(hex, alpha = 0.15) {
    if (!hex || hex === '#000000') return `rgba(148, 163, 184, ${alpha})`;
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return `rgba(148, 163, 184, ${alpha})`;
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const CommandManagement = () => {
    const { token, canManageCommands, isOwner, user } = useAuth();

    // Data States
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [commandsMap, setCommandsMap] = useState({});
    const [guildRoles, setGuildRoles] = useState([]);
    const [guildInfo, setGuildInfo] = useState({ id: '', name: 'Blood Alliance' });
    const [resolvedMembers, setResolvedMembers] = useState({});

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'public' | 'restricted' | 'members'
    const [sortBy, setSortBy] = useState('name-asc'); // 'name-asc' | 'name-desc' | 'roles-desc'

    // Notification Toast State
    const [toast, setToast] = useState(null);
    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => {
            setToast(null);
        }, 4000);
    }, []);

    // Edit View (Full-Screen Modal) State
    const [editingCommand, setEditingCommand] = useState(null);
    const [draftRoles, setDraftRoles] = useState({}); // { [roleName]: roleId }
    const [draftMembers, setDraftMembers] = useState([]); // Array of member objects: { id, username, displayName, avatarUrl }
    const [saving, setSaving] = useState(false);

    // Edit View: Role Picker states
    const [roleSearch, setRoleSearch] = useState('');
    const [rolePickerOpen, setRolePickerOpen] = useState(false);
    const rolePickerRef = useRef(null);

    // Edit View: Member Search states
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [memberSearchResults, setMemberSearchResults] = useState([]);
    const [memberSearching, setMemberSearching] = useState(false);
    const [memberSearchDropdownOpen, setMemberSearchDropdownOpen] = useState(false);
    const memberSearchRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (rolePickerRef.current && !rolePickerRef.current.contains(e.target)) {
                setRolePickerOpen(false);
            }
            if (memberSearchRef.current && !memberSearchRef.current.contains(e.target)) {
                setMemberSearchDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    // 1. Fetch Commands & Permissions from API
    const loadCommandsData = useCallback(async (isRefresh = false) => {
        if (!token) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/bot-commands', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP ${res.status}: Failed to load command permissions`);
            }

            const data = await res.json();
            if (data.permissions) {
                setCommandsMap(data.permissions);
            }
            if (Array.isArray(data.roles)) {
                setGuildRoles(data.roles);
            }
            if (data.guildInfo) {
                setGuildInfo(data.guildInfo);
            }
            if (data.resolvedMembers) {
                setResolvedMembers(prev => ({ ...prev, ...data.resolvedMembers }));
            }
            if (isRefresh) {
                showToast('Permissions reloaded from bot server', 'info');
            }
        } catch (err) {
            console.error('[CommandManagement] Load error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token, showToast]);

    useEffect(() => {
        loadCommandsData();
    }, [loadCommandsData]);

    // Map role IDs to role details for fast lookup
    const roleIdMap = useMemo(() => {
        const map = new Map();
        for (const r of guildRoles) {
            map.set(r.id, r);
            map.set(r.name.toLowerCase(), r);
        }
        return map;
    }, [guildRoles]);

    // Helper to get role color
    const getRoleColor = useCallback((roleName, roleId) => {
        if (roleName === '@everyone' || roleId === '@everyone') return '#38bdf8';
        if (roleId && roleIdMap.has(roleId)) {
            const r = roleIdMap.get(roleId);
            if (r.color && r.color !== '#000000') return r.color;
        }
        if (roleName && roleIdMap.has(roleName.toLowerCase())) {
            const r = roleIdMap.get(roleName.toLowerCase());
            if (r.color && r.color !== '#000000') return r.color;
        }
        return '#94a3b8';
    }, [roleIdMap]);

    // Normalize command list into array for rendering & filtering
    const commandsList = useMemo(() => {
        return Object.entries(commandsMap).map(([cmdKey, config]) => {
            const rolesObj = config?.roles || {};
            let membersArr = [];

            if (Array.isArray(config?.members)) {
                membersArr = config.members.map(m => (typeof m === 'object' && m !== null ? (m.id || m.userId) : m)).filter(Boolean);
            } else if (typeof config?.members === 'object' && config?.members !== null) {
                membersArr = Object.values(config.members).filter(Boolean);
            }

            const isPublic = Boolean(
                rolesObj['@everyone'] !== undefined ||
                Object.values(rolesObj).includes('@everyone') ||
                config?.unrestricted === true
            );

            return {
                name: cmdKey,
                roles: rolesObj,
                members: membersArr,
                isPublic,
                rolesCount: Object.keys(rolesObj).length,
                membersCount: membersArr.length
            };
        });
    }, [commandsMap]);

    // Stats
    const stats = useMemo(() => {
        const total = commandsList.length;
        const publicCount = commandsList.filter(c => c.isPublic).length;
        const memberOverrideCount = commandsList.filter(c => c.membersCount > 0).length;
        const restrictedCount = total - publicCount;
        return {
            total,
            publicCount,
            restrictedCount,
            memberOverrideCount,
            guildRolesCount: guildRoles.length
        };
    }, [commandsList, guildRoles]);

    // Filter & Search Logic
    const filteredCommands = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();

        return commandsList
            .filter(cmd => {
                // Category Tab
                if (activeFilter === 'public' && !cmd.isPublic) return false;
                if (activeFilter === 'restricted' && cmd.isPublic) return false;
                if (activeFilter === 'members' && cmd.membersCount === 0) return false;

                // Search query
                if (!q) return true;

                // Match command name
                if (cmd.name.toLowerCase().includes(q)) return true;

                // Match allowed role names or IDs
                for (const [rName, rId] of Object.entries(cmd.roles)) {
                    if (rName.toLowerCase().includes(q) || String(rId).includes(q)) return true;
                }

                // Match allowed members
                for (const mId of cmd.members) {
                    if (String(mId).includes(q)) return true;
                    const resolved = resolvedMembers[mId];
                    if (resolved) {
                        if (resolved.username?.toLowerCase().includes(q)) return true;
                        if (resolved.displayName?.toLowerCase().includes(q)) return true;
                    }
                }

                return false;
            })
            .sort((a, b) => {
                if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
                if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
                if (sortBy === 'roles-desc') return b.rolesCount - a.rolesCount;
                return 0;
            });
    }, [commandsList, activeFilter, searchQuery, sortBy, resolvedMembers]);

    // 2. Open Edit View for a single command
    const handleOpenEdit = useCallback(async (cmd) => {
        setEditingCommand(cmd);

        // Deep copy roles
        const initialRoles = { ...(cmd.roles || {}) };
        setDraftRoles(initialRoles);

        // Prepare member objects
        const initialMembers = [];
        for (const mId of cmd.members) {
            const cleanId = String(mId);
            if (resolvedMembers[cleanId]) {
                initialMembers.push(resolvedMembers[cleanId]);
            } else {
                initialMembers.push({
                    id: cleanId,
                    username: cleanId,
                    displayName: `User (${cleanId.slice(-4)})`,
                    avatarUrl: `https://cdn.discordapp.com/embed/avatars/0.png`
                });
            }
        }
        setDraftMembers(initialMembers);

        // Reset search states in modal
        setRoleSearch('');
        setRolePickerOpen(false);
        setMemberSearchQuery('');
        setMemberSearchResults([]);
        setMemberSearchDropdownOpen(false);

        // Lock background scroll
        document.body.style.overflow = 'hidden';

        // Async resolve any missing members
        const missingIds = cmd.members.filter(id => !resolvedMembers[id]);
        if (missingIds.length > 0 && token) {
            for (const uid of missingIds) {
                try {
                    const searchRes = await fetch(`/api/bot-commands?action=search-user&q=${uid}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (searchRes.ok) {
                        const sData = await searchRes.json();
                        if (sData.users && sData.users.length > 0) {
                            const uInfo = sData.users[0];
                            setResolvedMembers(prev => ({ ...prev, [uid]: uInfo }));
                            setDraftMembers(prev => prev.map(m => m.id === uid ? uInfo : m));
                        }
                    }
                } catch (_) {}
            }
        }
    }, [resolvedMembers, token]);

    // Close Edit View
    const handleCloseEdit = useCallback(() => {
        setEditingCommand(null);
        document.body.style.overflow = '';
    }, []);

    // ESC key listener to close modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && editingCommand) {
                handleCloseEdit();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [editingCommand, handleCloseEdit]);

    // Roles Management in Edit View
    const handleAddRole = (role) => {
        if (!role) return;
        setDraftRoles(prev => ({
            ...prev,
            [role.name]: role.id
        }));
        setRoleSearch('');
        setRolePickerOpen(false);
    };

    const handleRemoveRole = (roleName) => {
        setDraftRoles(prev => {
            const next = { ...prev };
            delete next[roleName];
            return next;
        });
    };

    // Filter available guild roles for picker
    const filteredGuildRoles = useMemo(() => {
        const q = roleSearch.toLowerCase().trim();
        return guildRoles.filter(r => {
            if (!q) return true;
            return r.name.toLowerCase().includes(q) || String(r.id).includes(q);
        });
    }, [guildRoles, roleSearch]);

    // Members Management in Edit View: Live Search via API
    useEffect(() => {
        if (!editingCommand) return;
        const q = memberSearchQuery.trim();
        if (q.length < 2) {
            setMemberSearchResults([]);
            setMemberSearchDropdownOpen(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setMemberSearching(true);
            try {
                const res = await fetch(`/api/bot-commands?action=search-user&q=${encodeURIComponent(q)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.users)) {
                        setMemberSearchResults(data.users);
                        setMemberSearchDropdownOpen(true);
                    }
                }
            } catch (err) {
                console.error('[MemberSearch] Error:', err);
            } finally {
                setMemberSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [memberSearchQuery, editingCommand, token]);

    const handleAddMember = (userObj) => {
        if (!userObj || !userObj.id) return;
        const cleanId = String(userObj.id).trim();

        if (draftMembers.some(m => m.id === cleanId)) {
            showToast('User is already added to this command', 'info');
            setMemberSearchQuery('');
            setMemberSearchDropdownOpen(false);
            return;
        }

        setDraftMembers(prev => [...prev, userObj]);
        setResolvedMembers(prev => ({ ...prev, [cleanId]: userObj }));
        setMemberSearchQuery('');
        setMemberSearchDropdownOpen(false);
    };

    const handleAddMemberById = async () => {
        const raw = memberSearchQuery.trim();
        if (!raw) return;

        // If user already in draft
        if (draftMembers.some(m => m.id === raw || m.username.toLowerCase() === raw.toLowerCase())) {
            showToast('User is already added', 'info');
            return;
        }

        setMemberSearching(true);
        try {
            const res = await fetch(`/api/bot-commands?action=search-user&q=${encodeURIComponent(raw)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.users && data.users.length > 0) {
                    handleAddMember(data.users[0]);
                    return;
                }
            }
        } catch (_) {}
        finally {
            setMemberSearching(false);
        }

        // Fallback: Add directly with ID
        const fallbackUser = {
            id: raw,
            username: raw,
            displayName: `User (${raw})`,
            avatarUrl: `https://cdn.discordapp.com/embed/avatars/0.png`
        };
        handleAddMember(fallbackUser);
    };

    const handleRemoveMember = (memberId) => {
        setDraftMembers(prev => prev.filter(m => m.id !== memberId));
    };

    // Check if draft has unsaved changes
    const isDirty = useMemo(() => {
        if (!editingCommand) return false;

        const origRoles = editingCommand.roles || {};
        const currRoles = draftRoles || {};

        if (Object.keys(origRoles).length !== Object.keys(currRoles).length) return true;
        for (const [k, v] of Object.entries(origRoles)) {
            if (currRoles[k] !== v) return true;
        }

        const origMembers = (editingCommand.members || []).map(String).sort();
        const currMembers = draftMembers.map(m => String(m.id)).sort();

        if (origMembers.length !== currMembers.length) return true;
        for (let i = 0; i < origMembers.length; i++) {
            if (origMembers[i] !== currMembers[i]) return true;
        }

        return false;
    }, [editingCommand, draftRoles, draftMembers]);

    // 3. Save Changes back to Central Permissions Config
    const handleSaveCommand = async () => {
        if (!editingCommand || saving) return;
        setSaving(true);

        try {
            const memberIds = draftMembers.map(m => m.id);
            const res = await fetch('/api/bot-commands', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    command: editingCommand.name,
                    roles: draftRoles,
                    members: memberIds
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update permissions');
            }

            // Immediately update local state in commandsMap
            setCommandsMap(prev => ({
                ...prev,
                [editingCommand.name]: {
                    roles: draftRoles,
                    members: memberIds
                }
            }));

            // Update active editing command state
            const isPublicNow = Boolean(
                draftRoles['@everyone'] !== undefined ||
                Object.values(draftRoles).includes('@everyone')
            );
            setEditingCommand(prev => ({
                ...prev,
                roles: draftRoles,
                members: memberIds,
                isPublic: isPublicNow,
                rolesCount: Object.keys(draftRoles).length,
                membersCount: memberIds.length
            }));

            showToast(`Permissions for /${editingCommand.name} updated immediately!`, 'success');
        } catch (err) {
            console.error('[SaveCommand] Error:', err);
            showToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Live access evaluation for Edit View
    const isPublicDraft = Boolean(draftRoles['@everyone'] !== undefined);

    return (
        <div className={`container ${styles.pageContainer}`}>
            {/* Header */}
            <div className={styles.headerRow}>
                <div className={styles.titleArea}>
                    <h1 className={styles.title}>
                        <div className={styles.titleIconWrap}>
                            <Terminal size={20} />
                        </div>
                        <span>Bot Command Management</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Configure access control, Discord role assignments, and member overrides for all bot commands.
                    </p>
                </div>

                <div className={styles.headerActions}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => loadCommandsData(true)}
                        disabled={refreshing || loading}
                        style={{ height: 38, fontSize: '0.78rem' }}
                        title="Reload latest permissions from bot server"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} style={{ marginRight: 6 }} />
                        {refreshing ? 'Reloading...' : 'Reload'}
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            marginBottom: '1.25rem',
                            padding: '0.75rem 1.25rem',
                            borderRadius: 4,
                            background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.15)' :
                                        toast.type === 'info' ? 'rgba(56, 189, 248, 0.15)' :
                                        'rgba(16, 185, 129, 0.15)',
                            border: `1px solid ${
                                toast.type === 'error' ? 'rgba(239, 68, 68, 0.4)' :
                                toast.type === 'info' ? 'rgba(56, 189, 248, 0.4)' :
                                'rgba(16, 185, 129, 0.4)'
                            }`,
                            color: toast.type === 'error' ? '#f87171' :
                                   toast.type === 'info' ? '#38bdf8' :
                                   '#34d399',
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            fontFamily: 'JetBrains Mono',
                            fontWeight: 600
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                            <span>{toast.message}</span>
                        </div>
                        <button
                            onClick={() => setToast(null)}
                            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Overview */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIconWrap} style={{ color: 'var(--rh-red)', borderColor: 'rgba(238, 0, 0, 0.3)' }}>
                        <Terminal size={20} />
                    </div>
                    <div>
                        <div className={styles.statVal}>{stats.total}</div>
                        <div className={styles.statLbl}>Bot Commands</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrap} style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                        <Globe size={20} />
                    </div>
                    <div>
                        <div className={styles.statVal}>{stats.publicCount}</div>
                        <div className={styles.statLbl}>Public (@everyone)</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrap} style={{ color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
                        <Lock size={20} />
                    </div>
                    <div>
                        <div className={styles.statVal}>{stats.restrictedCount}</div>
                        <div className={styles.statLbl}>Role Restricted</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrap} style={{ color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.3)' }}>
                        <Users size={20} />
                    </div>
                    <div>
                        <div className={styles.statVal}>{stats.memberOverrideCount}</div>
                        <div className={styles.statLbl}>Member Overrides</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrap} style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                        <Layers size={20} />
                    </div>
                    <div>
                        <div className={styles.statVal}>{stats.guildRolesCount}</div>
                        <div className={styles.statLbl}>Discord Roles</div>
                    </div>
                </div>
            </div>

            {/* Controls Bar: Filters & Search */}
            <div className={styles.controlsBar}>
                <div className={styles.filterTabs}>
                    <button
                        className={`${styles.filterTab} ${activeFilter === 'all' ? styles.filterTabActive : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        <span>All Commands</span>
                        <span className={styles.tabBadge}>{stats.total}</span>
                    </button>

                    <button
                        className={`${styles.filterTab} ${activeFilter === 'public' ? styles.filterTabActive : ''}`}
                        onClick={() => setActiveFilter('public')}
                    >
                        <Globe size={13} style={{ color: '#34d399' }} />
                        <span>Public</span>
                        <span className={styles.tabBadge}>{stats.publicCount}</span>
                    </button>

                    <button
                        className={`${styles.filterTab} ${activeFilter === 'restricted' ? styles.filterTabActive : ''}`}
                        onClick={() => setActiveFilter('restricted')}
                    >
                        <Lock size={13} style={{ color: '#c084fc' }} />
                        <span>Restricted</span>
                        <span className={styles.tabBadge}>{stats.restrictedCount}</span>
                    </button>

                    <button
                        className={`${styles.filterTab} ${activeFilter === 'members' ? styles.filterTabActive : ''}`}
                        onClick={() => setActiveFilter('members')}
                    >
                        <Users size={13} style={{ color: '#60a5fa' }} />
                        <span>Member Overrides</span>
                        <span className={styles.tabBadge}>{stats.memberOverrideCount}</span>
                    </button>
                </div>

                <div className={styles.searchWrapper}>
                    <Search size={15} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search command, role, or user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className={styles.clearSearchBtn} onClick={() => setSearchQuery('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '1.25rem',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 4,
                    color: '#f87171',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <AlertCircle size={20} />
                    <div>
                        <div style={{ fontWeight: 700 }}>Connection Error</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{error}</div>
                    </div>
                </div>
            )}

            {/* Main Commands Table */}
            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <div>Command</div>
                    <div>Access Type</div>
                    <div>Allowed Roles</div>
                    <div>Allowed Members</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {loading ? (
                    <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--rh-red)' }} />
                        <div>Loading Discord bot commands & permissions...</div>
                    </div>
                ) : filteredCommands.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Search size={28} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                        <div>No bot commands match your search criteria.</div>
                    </div>
                ) : (
                    filteredCommands.map(cmd => {
                        const roleEntries = Object.entries(cmd.roles);
                        const displayedRoles = roleEntries.slice(0, 3);
                        const extraRolesCount = roleEntries.length - displayedRoles.length;

                        const displayedMembers = cmd.members.slice(0, 3);
                        const extraMembersCount = cmd.members.length - displayedMembers.length;

                        return (
                            <div
                                key={cmd.name}
                                className={styles.commandRow}
                                onClick={() => handleOpenEdit(cmd)}
                                title={`Click to edit permissions for /${cmd.name}`}
                            >
                                {/* 1. Command Name */}
                                <div className={styles.commandNameWrap}>
                                    <div className={styles.commandBadge}>
                                        <span className={styles.commandPrefix}>/</span>
                                        <span>{cmd.name}</span>
                                    </div>
                                </div>

                                {/* 2. Access Type */}
                                <div>
                                    {cmd.isPublic ? (
                                        <span className={`${styles.accessBadge} ${styles.accessPublic}`}>
                                            <Globe size={11} />
                                            <span>PUBLIC</span>
                                        </span>
                                    ) : roleEntries.length > 0 ? (
                                        <span className={`${styles.accessBadge} ${styles.accessRestricted}`}>
                                            <Lock size={11} />
                                            <span>RESTRICTED</span>
                                        </span>
                                    ) : (
                                        <span className={`${styles.accessBadge} ${styles.accessSuperuser}`}>
                                            <Shield size={11} />
                                            <span>OWNER ONLY</span>
                                        </span>
                                    )}
                                </div>

                                {/* 3. Allowed Roles */}
                                <div className={styles.chipsContainer}>
                                    {roleEntries.length === 0 ? (
                                        <span className={styles.noneText}>No roles assigned</span>
                                    ) : (
                                        <>
                                            {displayedRoles.map(([rName, rId]) => {
                                                const color = getRoleColor(rName, rId);
                                                return (
                                                    <span
                                                        key={rName}
                                                        className={styles.roleChip}
                                                        style={{
                                                            color: getContrastingColor(color),
                                                            borderColor: hexToRgba(color, 0.4),
                                                            background: hexToRgba(color, 0.12)
                                                        }}
                                                    >
                                                        <span
                                                            className={styles.roleDot}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                        <span>{rName}</span>
                                                    </span>
                                                );
                                            })}
                                            {extraRolesCount > 0 && (
                                                <span className={styles.moreCountChip}>
                                                    +{extraRolesCount} more
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* 4. Allowed Members */}
                                <div className={styles.chipsContainer}>
                                    {cmd.members.length === 0 ? (
                                        <span className={styles.noneText}>No member overrides</span>
                                    ) : (
                                        <>
                                            {displayedMembers.map(mId => {
                                                const resolved = resolvedMembers[mId];
                                                const name = resolved?.displayName || resolved?.username || `User (${String(mId).slice(-4)})`;
                                                return (
                                                    <span key={mId} className={styles.memberChip}>
                                                        <img
                                                            src={resolved?.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`}
                                                            alt=""
                                                            className={styles.memberAvatarTiny}
                                                        />
                                                        <span>{name}</span>
                                                    </span>
                                                );
                                            })}
                                            {extraMembersCount > 0 && (
                                                <span className={styles.moreCountChip}>
                                                    +{extraMembersCount} more
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* 5. Action */}
                                <div style={{ textAlign: 'right' }}>
                                    <button
                                        type="button"
                                        className={`btn btn-secondary ${styles.editRowBtn}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEdit(cmd);
                                        }}
                                    >
                                        <Settings size={13} />
                                        <span>Edit</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ========================================================= */}
            {/* FULL-SCREEN POPUP / EDIT VIEW                             */}
            {/* ========================================================= */}
            {createPortal(
                <AnimatePresence>
                    {editingCommand && (
                        <motion.div
                            className={styles.modalOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            <div className={styles.modalContent}>
                                {/* Modal Top Bar */}
                                <div className={styles.modalTopBar}>
                                    <div className={styles.modalTitleSection}>
                                        <div className={styles.modalCommandBadge}>
                                            <span style={{ color: 'var(--rh-red)' }}>/</span>
                                            <span>{editingCommand.name}</span>
                                        </div>

                                        <div className={styles.modalTitleMeta}>
                                            <div className={styles.modalTitleHeadingRow}>
                                                <span className={styles.modalMainTitle}>
                                                    Edit Command Permissions
                                                </span>
                                                {isPublicDraft ? (
                                                    <span className={`${styles.accessBadge} ${styles.accessPublic}`}>
                                                        <Globe size={11} />
                                                        <span>PUBLIC ACCESS</span>
                                                    </span>
                                                ) : (
                                                    <span className={`${styles.accessBadge} ${styles.accessRestricted}`}>
                                                        <Lock size={11} />
                                                        <span>ROLE RESTRICTED</span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.modalTitleText}>
                                                Changes take effect on Discord bot command checks immediately upon saving.
                                            </div>
                                        </div>
                                    </div>

                                <div className={styles.modalActions}>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleSaveCommand}
                                        disabled={saving}
                                        style={{ height: 38, fontSize: '0.82rem', padding: '0 1.25rem' }}
                                    >
                                        {saving ? (
                                            <RefreshCw size={14} className="animate-spin" style={{ marginRight: 6 }} />
                                        ) : (
                                            <Save size={14} style={{ marginRight: 6 }} />
                                        )}
                                        {saving ? 'Saving Changes...' : 'Save Changes'}
                                    </button>

                                    <button
                                        type="button"
                                        className={styles.closeModalBtn}
                                        onClick={handleCloseEdit}
                                        title="Close (Esc)"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* 2-Column Edit Grid */}
                            <div className={styles.editGrid}>
                                {/* COLUMN 1: ROLES MANAGEMENT */}
                                <div className={styles.editSectionCard}>
                                    <div className={styles.editSectionHeader}>
                                        <div className={styles.sectionTitle}>
                                            <Shield size={16} style={{ color: '#f472b6' }} />
                                            <span>Allowed Roles</span>
                                            <span className={styles.sectionBadge}>
                                                {Object.keys(draftRoles).length} selected
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.sectionBody}>
                                        <div className={styles.sectionDescription}>
                                            Members holding any of these Discord roles will be permitted to execute this command.
                                        </div>

                                        {/* Searchable Role Picker Dropdown */}
                                        <div className={styles.rolePickerWrapper} ref={rolePickerRef}>
                                            <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="text"
                                                className={styles.roleSearchInput}
                                                placeholder="Pick a role to add (type role name or ID)..."
                                                value={roleSearch}
                                                onFocus={() => setRolePickerOpen(true)}
                                                onChange={(e) => {
                                                    setRoleSearch(e.target.value);
                                                    setRolePickerOpen(true);
                                                }}
                                            />

                                            {rolePickerOpen && (
                                                <div className={styles.roleDropdownList}>
                                                    {/* Quick @everyone option */}
                                                    {!draftRoles['@everyone'] && (
                                                        <div
                                                            className={styles.roleDropdownItem}
                                                            onClick={() => handleAddRole({ name: '@everyone', id: '@everyone' })}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <Globe size={14} style={{ color: '#38bdf8' }} />
                                                                <span style={{ fontWeight: 700, color: '#38bdf8' }}>@everyone</span>
                                                            </div>
                                                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Public access</span>
                                                        </div>
                                                    )}

                                                    {filteredGuildRoles.length === 0 ? (
                                                        <div style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            No matching roles found in server.
                                                        </div>
                                                    ) : (
                                                        filteredGuildRoles.map(r => {
                                                            const isAdded = Boolean(draftRoles[r.name] !== undefined || Object.values(draftRoles).includes(r.id));
                                                            const color = r.color && r.color !== '#000000' ? r.color : '#94a3b8';
                                                            return (
                                                                <div
                                                                    key={r.id}
                                                                    className={`${styles.roleDropdownItem} ${isAdded ? styles.roleDropdownItemAdded : ''}`}
                                                                    onClick={() => {
                                                                        if (!isAdded) handleAddRole(r);
                                                                    }}
                                                                >
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                                        <span
                                                                            style={{
                                                                                width: 10,
                                                                                height: 10,
                                                                                borderRadius: '50%',
                                                                                backgroundColor: color,
                                                                                flexShrink: 0
                                                                            }}
                                                                        />
                                                                        <span style={{ color: getContrastingColor(color), fontWeight: 600, fontSize: '0.8rem' }}>
                                                                            {r.name}
                                                                        </span>
                                                                    </div>

                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        <span style={{ fontSize: '0.68rem', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                                                                            {r.id}
                                                                        </span>
                                                                        {isAdded && (
                                                                            <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>
                                                                                ADDED
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Roles List (Authentic Discord Mentions) */}
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            Active Allowed Roles ({Object.keys(draftRoles).length})
                                        </div>

                                        <div className={styles.selectedListContainer}>
                                            {Object.keys(draftRoles).length === 0 ? (
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic', margin: 'auto' }}>
                                                    No roles selected. Only Bot Superusers & Owners will have access.
                                                </div>
                                            ) : (
                                                Object.entries(draftRoles).map(([rName, rId]) => {
                                                    const color = getRoleColor(rName, rId);
                                                    return (
                                                        <div
                                                            key={rName}
                                                            className={styles.discordRoleMention}
                                                            style={{
                                                                backgroundColor: hexToRgba(color, 0.18),
                                                                borderColor: hexToRgba(color, 0.45),
                                                                color: getContrastingColor(color)
                                                            }}
                                                            title={`Role ID: ${rId}`}
                                                        >
                                                            <span className={styles.mentionAtSign}>@</span>
                                                            <span>{rName}</span>
                                                            <button
                                                                type="button"
                                                                className={styles.mentionRemoveBtn}
                                                                onClick={() => handleRemoveRole(rName)}
                                                                title={`Remove @${rName}`}
                                                            >
                                                                <X size={13} />
                                                            </button>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* COLUMN 2: MEMBERS MANAGEMENT */}
                                <div className={styles.editSectionCard}>
                                    <div className={styles.editSectionHeader}>
                                        <div className={styles.sectionTitle}>
                                            <Users size={16} style={{ color: '#60a5fa' }} />
                                            <span>Allowed Members</span>
                                            <span className={styles.sectionBadge}>
                                                {draftMembers.length} whitelisted
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.sectionBody}>
                                        <div className={styles.sectionDescription}>
                                            Whitelist specific Discord users to execute this command regardless of their roles.
                                        </div>

                                        {/* Member Username Search & Lookup */}
                                        <div className={styles.memberSearchWrapper} ref={memberSearchRef}>
                                            <div style={{ position: 'relative', flex: 1 }}>
                                                <UserPlus size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <input
                                                    type="text"
                                                    className={styles.memberSearchInput}
                                                    placeholder="Type Discord username or paste User ID..."
                                                    value={memberSearchQuery}
                                                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddMemberById();
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={handleAddMemberById}
                                                disabled={memberSearching || !memberSearchQuery.trim()}
                                                style={{ height: 40, padding: '0 1rem', fontSize: '0.78rem' }}
                                            >
                                                {memberSearching ? (
                                                    <RefreshCw size={13} className="animate-spin" />
                                                ) : (
                                                    <Plus size={14} />
                                                )}
                                                <span style={{ marginLeft: 5 }}>Add User</span>
                                            </button>

                                            {/* Live Search Results Dropdown */}
                                            {memberSearchDropdownOpen && memberSearchResults.length > 0 && (
                                                <div className={styles.memberSearchResultsDropdown}>
                                                    <div style={{ padding: '0.5rem 0.85rem', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                        Matching Server Members
                                                    </div>
                                                    {memberSearchResults.map(u => (
                                                        <div
                                                            key={u.id}
                                                            className={styles.memberResultItem}
                                                            onClick={() => handleAddMember(u)}
                                                        >
                                                            <div className={styles.memberResultInfo}>
                                                                <img
                                                                    src={u.avatarUrl}
                                                                    alt=""
                                                                    className={styles.memberAvatarMedium}
                                                                />
                                                                <div className={styles.memberNames}>
                                                                    <div className={styles.memberDisplayName}>
                                                                        {u.displayName}
                                                                    </div>
                                                                    <div className={styles.memberUsernameTag}>
                                                                        @{u.username} • {u.id}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary"
                                                                style={{ height: 26, fontSize: '0.7rem', padding: '0 0.5rem' }}
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Selected Whitelisted Members List */}
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            Active Whitelisted Users ({draftMembers.length})
                                        </div>

                                        <div className={styles.selectedListContainer}>
                                            {draftMembers.length === 0 ? (
                                                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic', margin: 'auto' }}>
                                                    No specific members whitelisted. Access relies entirely on assigned roles.
                                                </div>
                                            ) : (
                                                draftMembers.map(m => (
                                                    <div
                                                        key={m.id}
                                                        className={styles.discordMemberCard}
                                                        title={`User ID: ${m.id}`}
                                                    >
                                                        <img
                                                            src={m.avatarUrl || `https://cdn.discordapp.com/embed/avatars/0.png`}
                                                            alt=""
                                                            className={styles.memberCardAvatar}
                                                        />
                                                        <div className={styles.memberCardText}>
                                                            <span className={styles.memberCardUsername}>
                                                                @{m.username}
                                                            </span>
                                                            <span className={styles.memberCardId}>
                                                                ({m.id})
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className={styles.mentionRemoveBtn}
                                                            onClick={() => handleRemoveMember(m.id)}
                                                            title={`Remove @${m.username}`}
                                                        >
                                                            <X size={13} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Bottom Bar */}
                            <div className={styles.modalBottomBar}>
                                <div>
                                    {isDirty ? (
                                        <span className={styles.changeIndicator}>
                                            <AlertCircle size={14} />
                                            <span>You have unsaved changes</span>
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                                            Permissions in sync with server
                                        </span>
                                    )}
                                </div>

                                <div className={styles.bottomActionButtons}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCloseEdit}
                                        disabled={saving}
                                        style={{ height: 38, fontSize: '0.78rem' }}
                                    >
                                        <span>Cancel</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleSaveCommand}
                                        disabled={saving}
                                        style={{ height: 38, fontSize: '0.8rem', padding: '0 1.5rem' }}
                                    >
                                        {saving ? (
                                            <RefreshCw size={14} className="animate-spin" style={{ marginRight: 6 }} />
                                        ) : (
                                            <Save size={14} style={{ marginRight: 6 }} />
                                        )}
                                        {saving ? 'Saving Changes...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>,
            document.body
        )}
        </div>
    );
};

export default CommandManagement;
