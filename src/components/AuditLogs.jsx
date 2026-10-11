import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield, RefreshCw, Search, Calendar, X,
    Lock, Layers, Users, Clock, ArrowLeft, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from '@/css/AuditLogs.module.css';

const AuditLogs = () => {
    const { token, user } = useAuth();

    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ total: 0, clanChanges: 0, userChanges: 0, today: 0 });
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'clans' | 'users'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    const fetchLogs = async (currentPage = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                limit: '50'
            });

            if (selectedDate) params.append('date', selectedDate);
            if (searchQuery.trim()) params.append('search', searchQuery.trim());

            const res = await fetch(`/api/logs?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await res.json();
            if (res.ok && data.logs) {
                setLogs(data.logs);
                setTotalPages(data.totalPages || 1);
                setTotalLogs(data.total || 0);
                if (data.stats) setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to load audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(1);
        setPage(1);
    }, [selectedDate, searchQuery]);

    // Filter by Clan or User actions locally if category tab is toggled
    const filteredLogs = logs.filter(item => {
        if (categoryFilter === 'clans') {
            return ['CLAN_REORDER', 'CLAN_ADD', 'CLAN_EDIT', 'CLAN_DELETE'].includes(item.action);
        }
        if (categoryFilter === 'users') {
            return ['USER_CREATE', 'USER_EDIT', 'USER_DELETE'].includes(item.action);
        }
        return true;
    });

    const getActionBadge = (action) => {
        switch (action) {
            case 'CLAN_REORDER':
                return <span className={`${styles.actionBadge} ${styles.actionReorder}`}>Reordered Clans</span>;
            case 'CLAN_ADD':
                return <span className={`${styles.actionBadge} ${styles.actionAdd}`}>Added Clan</span>;
            case 'CLAN_EDIT':
                return <span className={`${styles.actionBadge} ${styles.actionEdit}`}>Edited Clan</span>;
            case 'CLAN_DELETE':
                return <span className={`${styles.actionBadge} ${styles.actionDelete}`}>Deleted Clan</span>;
            case 'USER_CREATE':
                return <span className={`${styles.actionBadge} ${styles.actionAdd}`}>Created User</span>;
            case 'USER_EDIT':
                return <span className={`${styles.actionBadge} ${styles.actionUser}`}>Edited User</span>;
            case 'USER_DELETE':
                return <span className={`${styles.actionBadge} ${styles.actionDelete}`}>Deleted User</span>;
            default:
                return <span className={styles.actionBadge}>{action}</span>;
        }
    };

    return (
        <div className={styles.auditPage}>
            <div className="container">
                {/* Header */}
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>
                            <Shield size={24} style={{ color: '#fbbf24' }} />
                            Audit & Activity Logs
                        </h1>
                        <p className={styles.subtitle}>
                            Tamper-proof record of all clan reorders, clan updates, and user modifications
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button onClick={() => fetchLogs(page)} className="btn btn-secondary">
                            <RefreshCw size={15} style={{ marginRight: 6 }} className={loading ? 'animate-spin' : ''} />
                            Refresh Logs
                        </button>
                    </div>
                </div>

                {/* Immutable Notice Banner */}
                <div className={styles.immutableBanner}>
                    <Lock size={15} />
                    <span>
                        Immutable Audit Trail: All actions performed by authorized members are permanently recorded. No deletion or editing of logs is permitted.
                    </span>
                </div>

                {/* Statistics Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrap}>
                            <Shield size={20} />
                        </div>
                        <div>
                            <div className={styles.statVal}>{stats.total}</div>
                            <div className={styles.statLbl}>Total Logged Actions</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrap} style={{ background: 'rgba(96, 165, 250, 0.12)', color: '#60a5fa' }}>
                            <Layers size={20} />
                        </div>
                        <div>
                            <div className={styles.statVal} style={{ color: '#60a5fa' }}>{stats.clanChanges}</div>
                            <div className={styles.statLbl}>Clan Mutations</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrap} style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc' }}>
                            <Users size={20} />
                        </div>
                        <div>
                            <div className={styles.statVal} style={{ color: '#c084fc' }}>{stats.userChanges}</div>
                            <div className={styles.statLbl}>User Mutations</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrap} style={{ background: 'rgba(74, 222, 128, 0.12)', color: '#4ade80' }}>
                            <Clock size={20} />
                        </div>
                        <div>
                            <div className={styles.statVal} style={{ color: '#4ade80' }}>{stats.today}</div>
                            <div className={styles.statLbl}>Actions Today</div>
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className={styles.controlsBar}>
                    <div className={styles.filterTabs}>
                        <button
                            className={`${styles.filterTab} ${categoryFilter === 'all' ? styles.filterTabActive : ''}`}
                            onClick={() => setCategoryFilter('all')}
                        >
                            All Logs ({logs.length})
                        </button>
                        <button
                            className={`${styles.filterTab} ${categoryFilter === 'clans' ? styles.filterTabActive : ''}`}
                            onClick={() => setCategoryFilter('clans')}
                        >
                            Clan Actions ({stats.clanChanges || 0})
                        </button>
                        <button
                            className={`${styles.filterTab} ${categoryFilter === 'users' ? styles.filterTabActive : ''}`}
                            onClick={() => setCategoryFilter('users')}
                        >
                            User Actions ({stats.userChanges || 0})
                        </button>
                    </div>

                    <div className={styles.controlsRight}>
                        {/* Date Filter */}
                        <div className={styles.dateFilterWrap}>
                            <Calendar size={13} className={styles.dateIcon} />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className={styles.dateInput}
                                title="Filter by date"
                            />
                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate('')}
                                    className={styles.dateClearBtn}
                                    title="Clear date"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className={styles.searchWrap}>
                            <Search size={15} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by email, target, action..."
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Logs Table */}
                <div className={styles.tableCard}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: 170 }}>Timestamp</th>
                                    <th style={{ width: 220 }}>Performed By</th>
                                    <th style={{ width: 150 }}>Action Type</th>
                                    <th style={{ width: 200 }}>Target</th>
                                    <th>Change Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                                            Loading audit records...
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                                            No audit logs found matching the filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map(item => {
                                        const isAllianceOwner = item.performedBy?.toLowerCase() === 'lohithreddy1819@gmail.com';
                                        return (
                                            <tr key={item.id}>
                                                {/* Timestamp */}
                                                <td>
                                                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                        {item.timestamp ? new Date(item.timestamp).toLocaleString(undefined, {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit'
                                                        }) : 'N/A'}
                                                    </span>
                                                </td>

                                                {/* Performed By */}
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
                                                            {item.performedBy}
                                                        </span>
                                                        <span className={`${styles.roleBadge} ${
                                                            isAllianceOwner ? styles.roleOwner :
                                                            item.userRole === 'admin' ? styles.roleAdmin :
                                                            styles.roleMod
                                                        }`}>
                                                            {isAllianceOwner ? 'OWNER' : item.userRole?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Action */}
                                                <td>
                                                    {getActionBadge(item.action)}
                                                </td>

                                                {/* Target */}
                                                <td>
                                                    <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                                        {item.target}
                                                    </span>
                                                </td>

                                                {/* Details */}
                                                <td>
                                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                                        {item.details}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className={styles.paginationRow}>
                            <span>
                                Page {page} of {totalPages} ({totalLogs} Total Records)
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => {
                                        if (page > 1) {
                                            setPage(page - 1);
                                            fetchLogs(page - 1);
                                        }
                                    }}
                                    disabled={page <= 1}
                                    className={styles.pageBtn}
                                >
                                    <ArrowLeft size={13} style={{ marginRight: 4 }} /> Previous
                                </button>
                                <button
                                    onClick={() => {
                                        if (page < totalPages) {
                                            setPage(page + 1);
                                            fetchLogs(page + 1);
                                        }
                                    }}
                                    disabled={page >= totalPages}
                                    className={styles.pageBtn}
                                >
                                    Next <ArrowRight size={13} style={{ marginLeft: 4 }} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
