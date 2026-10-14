import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ticket, UserCheck, Search, RefreshCw, AlertCircle, CheckCircle2,
    Clock, ExternalLink, Calendar, User, FileText, Filter, SlidersHorizontal, X, Shield
} from 'lucide-react';
import { getTownHallImage } from '../utils/playerProfileUtils';
import { useAuth } from '../context/AuthContext';
import styles from '@/css/TicketManagement.module.css';

const TicketManagement = () => {
    const { token } = useAuth();

    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ total: 0, claimed: 0, unclaimed: 0, transcripts: 0 });
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'fwa' | 'warEntry' | 'allianceApply'
    const [selectedDate, setSelectedDate] = useState(''); // 'YYYY-MM-DD'
    const [datePreset, setDatePreset] = useState('all'); // 'all' | 'today' | '7days' | '30days' | 'custom'
    const [claimStatus, setClaimStatus] = useState('all'); // 'all' | 'claimed' | 'unclaimed'
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/tickets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.tickets) {
                setTickets(data.tickets);
                if (data.stats) setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to load tickets:', err);
            showFeedback('Failed to load tickets from Discord server', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const showFeedback = (message, type = 'success') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback({ message: '', type: '' }), 4000);
    };

    // Date filtering helper
    const matchesDateFilter = (ticketDateStr) => {
        if (!selectedDate && datePreset === 'all') return true;
        if (!ticketDateStr) return false;

        const tDate = new Date(ticketDateStr);
        if (isNaN(tDate.getTime())) return false;

        if (selectedDate) {
            const [y, m, d] = selectedDate.split('-').map(Number);
            return (
                tDate.getFullYear() === y &&
                (tDate.getMonth() + 1) === m &&
                tDate.getDate() === d
            );
        }

        const now = new Date();
        if (datePreset === 'today') {
            return (
                tDate.getFullYear() === now.getFullYear() &&
                tDate.getMonth() === now.getMonth() &&
                tDate.getDate() === now.getDate()
            );
        }

        if (datePreset === '7days') {
            const limit = new Date();
            limit.setDate(now.getDate() - 7);
            return tDate >= limit;
        }

        if (datePreset === '30days') {
            const limit = new Date();
            limit.setDate(now.getDate() - 30);
            return tDate >= limit;
        }

        return true;
    };

    // Filtered Tickets (by category, date, claim status, and search)
    const filteredTickets = tickets.filter(t => {
        const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
        const matchesDate = matchesDateFilter(t.ticketOpenedDate);
        const matchesClaim =
            claimStatus === 'all' ? true :
            claimStatus === 'claimed' ? Boolean(t.claimedBy) :
            !t.claimedBy;

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q ||
            t.ticketId?.toLowerCase().includes(q) ||
            t.userId?.toLowerCase().includes(q) ||
            t.userName?.toLowerCase().includes(q) ||
            t.claimedBy?.toLowerCase().includes(q) ||
            t.claimedByName?.toLowerCase().includes(q) ||
            t.ticketType?.toLowerCase().includes(q) ||
            t.playerName?.toLowerCase().includes(q) ||
            t.player_name?.toLowerCase().includes(q) ||
            t.playerTag?.toLowerCase().includes(q) ||
            t.assignedClan?.toLowerCase().includes(q) ||
            t.assignedClanTag?.toLowerCase().includes(q) ||
            String(t.playerTh || t.townHall || '').toLowerCase().includes(q);

        return matchesCategory && matchesDate && matchesClaim && matchesSearch;
    });

    // Count of active filters
    let activeFilterCount = 0;
    if (filterCategory !== 'all') activeFilterCount++;
    if (selectedDate || datePreset !== 'all') activeFilterCount++;
    if (claimStatus !== 'all') activeFilterCount++;

    const clearDate = () => {
        setSelectedDate('');
        setDatePreset('all');
    };

    const resetAllFilters = () => {
        setFilterCategory('all');
        setSelectedDate('');
        setDatePreset('all');
        setClaimStatus('all');
        setSearchQuery('');
    };

    return (
        <div className={styles.ticketPage}>
            <div className="container">
                {/* Header */}
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>
                            <Ticket size={24} style={{ color: 'var(--rh-red)' }} />
                            Discord Ticket Management
                        </h1>
                        <p className={styles.subtitle}>
                            Live applicant ticket data from endpoint: ticket types, openers, staff claims, and transcripts
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button onClick={fetchTickets} className="btn btn-secondary">
                            <RefreshCw size={15} style={{ marginRight: 6 }} className={loading ? 'animate-spin' : ''} />
                            Refresh Live Data
                        </button>
                    </div>
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

                {/* Statistics Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrap}>
                            <Ticket size={20} />
                        </div>
                        <div>
                            <div className={styles.statVal}>{stats.total}</div>
                            <div className={styles.statLbl}>Total Tickets</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrap} style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }}>
                            <UserCheck size={20} />
                        </div>
                        <div>
                            <div className={styles.statVal} style={{ color: '#4ade80' }}>{stats.claimed}</div>
                            <div className={styles.statLbl}>Claimed by Staff</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrap} style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
                            <Clock size={20} />
                        </div>
                        <div>
                            <div className={styles.statVal} style={{ color: '#fbbf24' }}>{stats.unclaimed}</div>
                            <div className={styles.statLbl}>Awaiting Claim</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrap} style={{ background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }}>
                            <FileText size={20} />
                        </div>
                        <div>
                            <div className={styles.statVal} style={{ color: '#60a5fa' }}>{stats.transcripts}</div>
                            <div className={styles.statLbl}>Transcripts Saved</div>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className={styles.controlsBar}>
                    {/* Desktop Category Tabs */}
                    <div className={styles.desktopCategoryTabs}>
                        <button
                            className={`${styles.catTab} ${filterCategory === 'all' ? styles.catTabActive : ''}`}
                            onClick={() => setFilterCategory('all')}
                        >
                            All Tickets ({tickets.length})
                        </button>
                        <button
                            className={`${styles.catTab} ${filterCategory === 'fwa' ? styles.catTabActive : ''}`}
                            onClick={() => setFilterCategory('fwa')}
                        >
                            FWA ({stats.fwaCount || 0})
                        </button>
                        <button
                            className={`${styles.catTab} ${filterCategory === 'warEntry' ? styles.catTabActive : ''}`}
                            onClick={() => setFilterCategory('warEntry')}
                        >
                            War Entry ({stats.warEntryCount || 0})
                        </button>
                        <button
                            className={`${styles.catTab} ${filterCategory === 'allianceApply' ? styles.catTabActive : ''}`}
                            onClick={() => setFilterCategory('allianceApply')}
                        >
                            Alliance Apply ({stats.allianceApplyCount || 0})
                        </button>
                    </div>

                    <div className={styles.controlsRight}>
                        {/* Desktop Date Filter */}
                        <div className={`${styles.dateFilterWrap} ${styles.desktopDateWrap}`}>
                            <Calendar size={13} className={styles.dateIcon} />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setDatePreset(e.target.value ? 'custom' : 'all');
                                }}
                                className={styles.dateInput}
                                title="Filter tickets by date"
                            />
                            {selectedDate && (
                                <button
                                    onClick={clearDate}
                                    className={styles.dateClearBtn}
                                    title="Clear date filter"
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
                                placeholder="Search ID, Player, Clan, Staff..."
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Mobile Filter Button */}
                        <button
                            className={`${styles.mobileFilterTrigger} ${activeFilterCount > 0 ? styles.mobileFilterTriggerActive : ''}`}
                            onClick={() => setMobileFilterOpen(true)}
                        >
                            <SlidersHorizontal size={14} />
                            <span>Filter</span>
                            {activeFilterCount > 0 && (
                                <span className={styles.filterBadge}>{activeFilterCount}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Active Filter Pills Row */}
                {(activeFilterCount > 0 || searchQuery) && (
                    <div className={styles.activeFiltersRow}>
                        <span className={styles.activeFiltersLabel}>Filters:</span>

                        {filterCategory !== 'all' && (
                            <span className={styles.filterPill}>
                                <span>Type: {filterCategory === 'warEntry' ? 'War Entry' : filterCategory === 'allianceApply' ? 'Alliance Apply' : 'FWA'}</span>
                                <button onClick={() => setFilterCategory('all')} className={styles.filterPillRemove}>
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {selectedDate && (
                            <span className={styles.filterPill}>
                                <span>Date: {selectedDate}</span>
                                <button onClick={clearDate} className={styles.filterPillRemove}>
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {!selectedDate && datePreset !== 'all' && (
                            <span className={styles.filterPill}>
                                <span>Date: {datePreset === 'today' ? 'Today' : datePreset === '7days' ? 'Last 7 Days' : 'Last 30 Days'}</span>
                                <button onClick={() => setDatePreset('all')} className={styles.filterPillRemove}>
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {claimStatus !== 'all' && (
                            <span className={styles.filterPill}>
                                <span>Status: {claimStatus === 'claimed' ? 'Claimed' : 'Unclaimed'}</span>
                                <button onClick={() => setClaimStatus('all')} className={styles.filterPillRemove}>
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {searchQuery && (
                            <span className={styles.filterPill}>
                                <span>Search: "{searchQuery}"</span>
                                <button onClick={() => setSearchQuery('')} className={styles.filterPillRemove}>
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        <button onClick={resetAllFilters} className={styles.clearAllBtn}>
                            Reset all
                        </button>
                    </div>
                )}

                {/* Live Tickets Table */}
                <div className={styles.tableCard}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: 110, textAlign: 'left' }}>Ticket ID</th>
                                    <th style={{ width: 130, textAlign: 'left' }}>Ticket Type</th>
                                    <th style={{ width: 110, textAlign: 'left' }}>Player TH</th>
                                    <th style={{ width: 170, textAlign: 'left' }}>Player Name</th>
                                    <th style={{ width: 170, textAlign: 'left' }}>Assigned Clan</th>
                                    <th style={{ width: 160, textAlign: 'left' }}>Date Opened</th>
                                    <th style={{ width: 190, textAlign: 'left' }}>Who Claimed</th>
                                    <th style={{ width: 190, textAlign: 'left' }}>Opener / Applicant</th>
                                    <th style={{ textAlign: 'left' }}>Transcript Archive</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '3.5rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Fetching live ticket data from Discord bot...</span>
                                        </td>
                                    </tr>
                                ) : filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" style={{ textAlign: 'center', padding: '3.5rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>No tickets found matching the selected filter.</span>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTickets.map(ticket => {
                                        const catClass =
                                            ticket.category === 'fwa' ? styles.catFwa :
                                            ticket.category === 'warEntry' ? styles.catWar :
                                            styles.catAlliance;

                                        const thVal = ticket.playerTh || ticket.townHall || ticket.th || ticket.player_th;
                                        const thNum = thVal ? (typeof thVal === 'number' ? thVal : parseInt(String(thVal).replace(/\D/g, ''), 10)) : null;
                                        const thImg = thNum ? getTownHallImage(thNum) : null;

                                        const pName = ticket.playerName || ticket.player_name || ticket.inGameName || ticket.ign;
                                        const pTag = ticket.playerTag || ticket.player_tag || ticket.tag;

                                        const aClan = ticket.assignedClan || ticket.assigned_clan || ticket.assignedClanName || ticket.clan;
                                        const aClanTag = ticket.assignedClanTag || ticket.assigned_clan_tag || ticket.clanTag;

                                        return (
                                            <tr key={`${ticket.category}-${ticket.ticketId}`}>
                                                {/* Ticket ID */}
                                                <td>
                                                    <span className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                                        {ticket.ticketId}
                                                    </span>
                                                </td>

                                                {/* Ticket Type */}
                                                <td>
                                                    <span className={`${styles.catBadge} ${catClass}`}>
                                                        {ticket.ticketType || ticket.category}
                                                    </span>
                                                </td>

                                                {/* Player TH */}
                                                <td>
                                                    {thVal ? (
                                                        <div className={styles.thCell}>
                                                            {thImg && (
                                                                <img
                                                                    src={thImg}
                                                                    alt={`TH${thVal}`}
                                                                    className={styles.thImg}
                                                                />
                                                            )}
                                                            <span className={styles.thBadge}>
                                                                TH {thVal}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className={styles.emptyDash}>—</span>
                                                    )}
                                                </td>

                                                {/* Player Name */}
                                                <td>
                                                    {pName ? (
                                                        <div className={styles.playerCell}>
                                                            <div className={styles.playerName} title={pName}>
                                                                {pName}
                                                            </div>
                                                            {pTag && (
                                                                <a
                                                                    href={`https://link.clashofclans.com/?action=OpenPlayerProfile&tag=${encodeURIComponent(pTag)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={styles.playerTagLink}
                                                                >
                                                                    {pTag}
                                                                </a>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className={styles.emptyDash}>—</span>
                                                    )}
                                                </td>

                                                {/* Assigned Clan */}
                                                <td>
                                                    {aClan ? (
                                                        <div className={styles.clanCell}>
                                                            <div className={styles.clanNameRow} title={aClan}>
                                                                <Shield size={13} style={{ color: 'var(--rh-red)', flexShrink: 0 }} />
                                                                <span>{aClan}</span>
                                                            </div>
                                                            {aClanTag && (
                                                                <a
                                                                    href={`https://link.clashofclans.com/?action=OpenClanProfile&tag=${encodeURIComponent(aClanTag)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={styles.clanTagLink}
                                                                    style={{ marginLeft: '1.15rem' }}
                                                                >
                                                                    {aClanTag}
                                                                </a>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className={styles.emptyDash}>Unassigned</span>
                                                    )}
                                                </td>

                                                {/* Date */}
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                                                        <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                            {ticket.ticketOpenedDate
                                                                ? new Date(ticket.ticketOpenedDate).toLocaleString(undefined, {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })
                                                                : 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Who Claimed (Name + Discord ID) */}
                                                <td>
                                                    {ticket.claimedBy ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {ticket.claimedByAvatar ? (
                                                                <img
                                                                    src={ticket.claimedByAvatar}
                                                                    alt=""
                                                                    style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <div style={{
                                                                    width: 26, height: 26, borderRadius: '50%',
                                                                    background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                }}>
                                                                    <UserCheck size={14} />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div style={{ fontWeight: 600, color: '#4ade80', fontSize: '0.8125rem' }}>
                                                                    {ticket.claimedByName || ticket.claimedBy}
                                                                </div>
                                                                <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                                                    {ticket.claimedBy}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className={styles.unclaimedBadge}>
                                                            <Clock size={13} style={{ opacity: 0.7 }} />
                                                            <span>Unclaimed</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Opener / Applicant (Name + Discord ID) */}
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {ticket.userAvatar ? (
                                                            <img
                                                                src={ticket.userAvatar}
                                                                alt=""
                                                                style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <div style={{
                                                                width: 26, height: 26, borderRadius: '50%',
                                                                background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                                <User size={14} />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
                                                                {ticket.userName || ticket.userId}
                                                            </div>
                                                            <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                                                {ticket.userId}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Transcript */}
                                                <td>
                                                    {ticket.transcript ? (
                                                        <a
                                                            href={ticket.transcript}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.transcriptLink}
                                                        >
                                                            <ExternalLink size={13} /> View Transcript
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Filter Modal / Drawer */}
                <AnimatePresence>
                    {mobileFilterOpen && (
                        <div className={styles.modalBackdrop} onClick={() => setMobileFilterOpen(false)}>
                            <motion.div
                                initial={{ y: '100%', opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: '100%', opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className={styles.filterSheet}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.sheetHeader}>
                                    <h3 className={styles.sheetTitle}>
                                        <SlidersHorizontal size={16} style={{ color: 'var(--rh-red)' }} />
                                        Filter Tickets
                                    </h3>
                                    <button
                                        onClick={() => setMobileFilterOpen(false)}
                                        className={styles.sheetCloseBtn}
                                        aria-label="Close filters"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className={styles.sheetBody}>
                                    {/* 1. Ticket Type */}
                                    <div>
                                        <div className={styles.sheetSectionTitle}>
                                            <Ticket size={13} /> Ticket Type
                                        </div>
                                        <div className={styles.chipsGrid}>
                                            <button
                                                className={`${styles.chipOption} ${filterCategory === 'all' ? styles.chipOptionActive : ''}`}
                                                onClick={() => setFilterCategory('all')}
                                            >
                                                <span>All Tickets</span>
                                                <span className={styles.chipCount}>{tickets.length}</span>
                                            </button>
                                            <button
                                                className={`${styles.chipOption} ${filterCategory === 'fwa' ? styles.chipOptionActive : ''}`}
                                                onClick={() => setFilterCategory('fwa')}
                                            >
                                                <span>FWA</span>
                                                <span className={styles.chipCount}>{stats.fwaCount || 0}</span>
                                            </button>
                                            <button
                                                className={`${styles.chipOption} ${filterCategory === 'warEntry' ? styles.chipOptionActive : ''}`}
                                                onClick={() => setFilterCategory('warEntry')}
                                            >
                                                <span>War Entry</span>
                                                <span className={styles.chipCount}>{stats.warEntryCount || 0}</span>
                                            </button>
                                            <button
                                                className={`${styles.chipOption} ${filterCategory === 'allianceApply' ? styles.chipOptionActive : ''}`}
                                                onClick={() => setFilterCategory('allianceApply')}
                                            >
                                                <span>Alliance Apply</span>
                                                <span className={styles.chipCount}>{stats.allianceApplyCount || 0}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. Date Filter */}
                                    <div>
                                        <div className={styles.sheetSectionTitle}>
                                            <Calendar size={13} /> Filter By Date
                                        </div>
                                        <div className={styles.chipsGrid}>
                                            <button
                                                className={`${styles.chipOption} ${datePreset === 'all' && !selectedDate ? styles.chipOptionActive : ''}`}
                                                onClick={() => { setDatePreset('all'); setSelectedDate(''); }}
                                            >
                                                <span>All Dates</span>
                                            </button>
                                            <button
                                                className={`${styles.chipOption} ${datePreset === 'today' ? styles.chipOptionActive : ''}`}
                                                onClick={() => { setDatePreset('today'); setSelectedDate(''); }}
                                            >
                                                <span>Today</span>
                                            </button>
                                            <button
                                                className={`${styles.chipOption} ${datePreset === '7days' ? styles.chipOptionActive : ''}`}
                                                onClick={() => { setDatePreset('7days'); setSelectedDate(''); }}
                                            >
                                                <span>Last 7 Days</span>
                                            </button>
                                            <button
                                                className={`${styles.chipOption} ${datePreset === '30days' ? styles.chipOptionActive : ''}`}
                                                onClick={() => { setDatePreset('30days'); setSelectedDate(''); }}
                                            >
                                                <span>Last 30 Days</span>
                                            </button>
                                        </div>
                                        <div className={styles.sheetDateInputWrap}>
                                            <Calendar size={14} className={styles.dateIcon} />
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => {
                                                    setSelectedDate(e.target.value);
                                                    setDatePreset(e.target.value ? 'custom' : 'all');
                                                }}
                                                className={styles.sheetDateInput}
                                                title="Select custom date"
                                            />
                                        </div>
                                    </div>

                                    {/* 3. Claim Status */}
                                    <div>
                                        <div className={styles.sheetSectionTitle}>
                                            <UserCheck size={13} /> Claim Status
                                        </div>
                                        <div className={styles.chipsGrid}>
                                            <button
                                                className={`${styles.chipOption} ${claimStatus === 'all' ? styles.chipOptionActive : ''}`}
                                                onClick={() => setClaimStatus('all')}
                                            >
                                                <span>All Statuses</span>
                                            </button>
                                            <button
                                                className={`${styles.chipOption} ${claimStatus === 'claimed' ? styles.chipOptionActive : ''}`}
                                                onClick={() => setClaimStatus('claimed')}
                                            >
                                                <span>Claimed</span>
                                                <span className={styles.chipCount}>{stats.claimed || 0}</span>
                                            </button>
                                            <button
                                                className={`${styles.chipOption} ${claimStatus === 'unclaimed' ? styles.chipOptionActive : ''}`}
                                                onClick={() => setClaimStatus('unclaimed')}
                                            >
                                                <span>Unclaimed</span>
                                                <span className={styles.chipCount}>{stats.unclaimed || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.sheetFooter}>
                                    <button
                                        onClick={resetAllFilters}
                                        className={styles.sheetResetBtn}
                                    >
                                        Reset All
                                    </button>
                                    <button
                                        onClick={() => setMobileFilterOpen(false)}
                                        className={styles.sheetApplyBtn}
                                    >
                                        Show {filteredTickets.length} Result{filteredTickets.length === 1 ? '' : 's'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TicketManagement;
