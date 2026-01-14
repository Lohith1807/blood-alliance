import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Shield, Users, Trophy, Swords, Target,
    Crown, ChevronUp, ChevronDown, Search, Star, Zap,
    Castle, Medal, TrendingUp, Activity, Database, BarChart3, Loader2
} from 'lucide-react';
import { useClans } from '../context/ClanContext';

// Town Hall image mapping - using weserv.nl proxy to bypass CORS
const getTownHallImage = (level) => {
    // Using weserv.nl as a CORS proxy for Fandom wiki images
    const baseProxy = 'https://images.weserv.nl/?url=';
    const townHallImages = {
        1: 'static.wikia.nocookie.net/clashofclans/images/f/fd/Town_Hall1.png/revision/latest/scale-to-width-down/100',
        2: 'static.wikia.nocookie.net/clashofclans/images/7/7d/Town_Hall2.png/revision/latest/scale-to-width-down/100',
        3: 'static.wikia.nocookie.net/clashofclans/images/d/dd/Town_Hall3.png/revision/latest/scale-to-width-down/100',
        4: 'static.wikia.nocookie.net/clashofclans/images/e/e7/Town_Hall4.png/revision/latest/scale-to-width-down/100',
        5: 'static.wikia.nocookie.net/clashofclans/images/a/a3/Town_Hall5.png/revision/latest/scale-to-width-down/100',
        6: 'static.wikia.nocookie.net/clashofclans/images/5/52/Town_Hall6.png/revision/latest/scale-to-width-down/100',
        7: 'static.wikia.nocookie.net/clashofclans/images/7/75/Town_Hall7.png/revision/latest/scale-to-width-down/100',
        8: 'static.wikia.nocookie.net/clashofclans/images/f/fa/Town_Hall8.png/revision/latest/scale-to-width-down/100',
        9: 'static.wikia.nocookie.net/clashofclans/images/e/e0/Town_Hall9.png/revision/latest/scale-to-width-down/100',
        10: 'static.wikia.nocookie.net/clashofclans/images/5/5c/Town_Hall10.png/revision/latest/scale-to-width-down/110',
        11: 'static.wikia.nocookie.net/clashofclans/images/9/96/Town_Hall11.png/revision/latest/scale-to-width-down/105',
        12: 'static.wikia.nocookie.net/clashofclans/images/b/b7/Town_Hall12.png/revision/latest/scale-to-width-down/110',
        13: 'static.wikia.nocookie.net/clashofclans/images/7/73/Town_Hall13.png/revision/latest/scale-to-width-down/110',
        14: 'static.wikia.nocookie.net/clashofclans/images/b/b6/Town_Hall14.png/revision/latest/scale-to-width-down/110',
        15: 'static.wikia.nocookie.net/clashofclans/images/d/d4/Town_Hall15.png/revision/latest/scale-to-width-down/110',
        16: 'static.wikia.nocookie.net/clashofclans/images/5/53/Town_Hall16.png/revision/latest/scale-to-width-down/105',
        17: 'static.wikia.nocookie.net/clashofclans/images/2/24/Town_Hall17-1.png/revision/latest/scale-to-width-down/115',
        18: 'static.wikia.nocookie.net/clashofclans/images/7/76/Town_Hall18.png/revision/latest/scale-to-width-down/121',
    };
    return townHallImages[level] ? `${baseProxy}${townHallImages[level]}` : null;
};

const ClanDetail = ({ clanTag, onBack }) => {
    const { clans, loading, getClanByTag } = useClans();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'clanRank', direction: 'asc' });

    // Find the clan from context
    const clan = useMemo(() => {
        return getClanByTag(clanTag);
    }, [clanTag, clans]);

    // Role hierarchy priority (lower number = higher rank)
    const getRolePriority = (role) => {
        switch (role) {
            case 'leader': return 1;
            case 'coLeader': return 2;
            case 'admin': return 3;      // Elder
            case 'member': return 4;
            default: return 5;
        }
    };

    // Filter and sort members
    const filteredMembers = useMemo(() => {
        if (!clan?.memberList) return [];

        let members = [...clan.memberList];

        // Filter by search
        if (searchTerm) {
            members = members.filter(member =>
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.tag.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        members.sort((a, b) => {
            let aVal, bVal;

            // Special handling for role sorting using hierarchy
            if (sortConfig.key === 'role') {
                aVal = getRolePriority(a.role);
                bVal = getRolePriority(b.role);
            } else {
                aVal = a[sortConfig.key];
                bVal = b[sortConfig.key];

                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }
            }

            if (sortConfig.direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
        });

        return members;
    }, [clan, searchTerm, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'leader': return '#EE0000';
            case 'coLeader': return '#FFD700';
            case 'admin': return '#10b981';
            default: return 'var(--text-muted)';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'leader': return 'LEADER';
            case 'coLeader': return 'CO-LEADER';
            case 'admin': return 'ELDER';
            default: return 'MEMBER';
        }
    };

    // Loading state
    if (loading) {
        return (
            <section className="container" style={{ padding: '6rem 0', minHeight: 'calc(100vh - 56px)' }}>
                <div style={styles.errorState}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader2 size={48} style={{ color: 'var(--rh-red)' }} />
                    </motion.div>
                    <h2 style={{ color: '#fff', marginBottom: '0.5rem', marginTop: '1rem' }}>FETCHING_DATA</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Loading clan data from Clash of Clans API...
                    </p>
                </div>
            </section>
        );
    }

    if (!clan) {
        return (
            <section className="container" style={{ padding: '6rem 0', minHeight: 'calc(100vh - 56px)' }}>
                <div style={styles.errorState}>
                    <Database size={48} style={{ color: 'var(--rh-red)', marginBottom: '1rem' }} />
                    <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>CLAN_NOT_FOUND</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Unable to retrieve data for clan tag: {clanTag}
                    </p>
                    <button onClick={onBack} className="btn btn-primary" style={styles.backButton}>
                        <ArrowLeft size={16} /> RETURN_TO_REGISTRY
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="container" style={{ padding: '6rem 0', minHeight: 'calc(100vh - 56px)' }}>
            {/* Back Button */}
            <motion.button
                onClick={onBack}
                style={styles.backNav}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: -5 }}
            >
                <ArrowLeft size={16} />
                <span>RETURN_TO_REGISTRY</span>
            </motion.button>

            {/* Clan Header */}
            <motion.div
                style={styles.header}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div style={styles.headerTop}>
                    <div className="mono" style={styles.techLabel}>
                        <BarChart3 size={14} /> UNIT_PROFILE: {clan.tag}
                    </div>
                    <div style={styles.statusBadge}>
                        <div style={styles.pulsingDot}></div>
                        <span>ONLINE</span>
                    </div>
                </div>

                <div style={styles.headerMain}>
                    <div style={styles.badgeWrapper}>
                        <img
                            src={clan.badgeUrls?.large || clan.badgeUrls?.medium}
                            alt={clan.name}
                            style={styles.clanBadge}
                            onError={(e) => { e.target.src = 'https://api-assets.clashofclans.com/badges/200/empty.png'; }}
                        />
                        <div style={styles.badgeGlow}></div>
                    </div>
                    <div style={styles.headerInfo}>
                        <h1 style={styles.clanName}>{clan.name}</h1>
                        <span className="mono" style={styles.clanTag}>{clan.tag}</span>
                        <p style={styles.description}>{clan.description}</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards Grid - 5 Important Info */}
            <motion.div
                style={styles.statsGrid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {/* Card 1: Clan Level & Points */}
                <div style={styles.statCard}>
                    <div style={styles.cardHeader}>
                        <Shield size={16} style={{ color: 'var(--rh-red)' }} />
                        <span>CLAN_METRICS</span>
                    </div>
                    <div style={styles.cardContent}>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>LEVEL</span>
                            <span className="mono" style={styles.statValue}>{clan.clanLevel}</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>TROPHIES</span>
                            <span className="mono" style={styles.statValue}>{clan.clanPoints?.toLocaleString()}</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>CAPITAL_PTS</span>
                            <span className="mono" style={styles.statValue}>{clan.clanCapitalPoints?.toLocaleString() || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Card 2: War Statistics */}
                <div style={styles.statCard}>
                    <div style={styles.cardHeader}>
                        <Swords size={16} style={{ color: 'var(--rh-red)' }} />
                        <span>WAR_RECORD</span>
                    </div>
                    <div style={styles.cardContent}>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>WINS</span>
                            <span className="mono" style={{ ...styles.statValue, color: '#10b981' }}>{clan.warWins}</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>LOSSES</span>
                            <span className="mono" style={{ ...styles.statValue, color: '#ef4444' }}>{clan.warLosses}</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>STREAK</span>
                            <span className="mono" style={styles.statValue}>{clan.warWinStreak}</span>
                        </div>
                    </div>
                </div>

                {/* Card 3: League Information */}
                <div style={styles.statCard}>
                    <div style={styles.cardHeader}>
                        <Trophy size={16} style={{ color: 'var(--rh-red)' }} />
                        <span>LEAGUE_STATUS</span>
                    </div>
                    <div style={styles.cardContent}>
                        <div style={styles.statItemFull}>
                            <span style={styles.statLabel}>WAR_LEAGUE</span>
                            <span className="mono" style={styles.statValueSmall}>{clan.warLeague?.name || 'N/A'}</span>
                        </div>
                        <div style={styles.statItemFull}>
                            <span style={styles.statLabel}>CAPITAL_LEAGUE</span>
                            <span className="mono" style={styles.statValueSmall}>{clan.capitalLeague?.name || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Card 4: Member Stats */}
                <div style={styles.statCard}>
                    <div style={styles.cardHeader}>
                        <Users size={16} style={{ color: 'var(--rh-red)' }} />
                        <span>PERSONNEL</span>
                    </div>
                    <div style={styles.cardContent}>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>ACTIVE</span>
                            <span className="mono" style={styles.statValue}>{clan.members}/50</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>CAPACITY</span>
                            <span className="mono" style={styles.statValue}>{Math.round((clan.members / 50) * 100)}%</span>
                        </div>
                        <div style={styles.statItem}>
                            <span style={styles.statLabel}>TYPE</span>
                            <span className="mono" style={styles.statValueSmall}>{clan.type?.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                {/* Card 5: War Frequency & Settings */}
                <div style={styles.statCard}>
                    <div style={styles.cardHeader}>
                        <Activity size={16} style={{ color: 'var(--rh-red)' }} />
                        <span>CONFIGURATION</span>
                    </div>
                    <div style={styles.cardContent}>
                        <div style={styles.statItemFull}>
                            <span style={styles.statLabel}>WAR_FREQ</span>
                            <span className="mono" style={styles.statValue}>{clan.warFrequency?.toUpperCase()}</span>
                        </div>
                        <div style={styles.statItemFull}>
                            <span style={styles.statLabel}>LOCATION</span>
                            <span className="mono" style={styles.statValueSmall}>{clan.location?.name || 'GLOBAL'}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Members Section */}
            <motion.div
                style={styles.membersSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div style={styles.membersHeader}>
                    <div style={styles.membersTitleArea}>
                        <div className="mono" style={styles.techLabel}>
                            <Database size={14} /> MEMBER_REGISTRY
                        </div>
                        <h2 style={styles.membersTitle}>Active Personnel ({filteredMembers.length})</h2>
                    </div>

                    {/* Search Input */}
                    <div style={styles.searchContainer}>
                        <Search size={14} style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="SEARCH_MEMBER..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                </div>

                {/* Members Table */}
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeaderRow}>
                                <th style={styles.tableHeader} onClick={() => handleSort('clanRank')}>
                                    <div style={styles.headerCell}>
                                        RANK
                                        {sortConfig.key === 'clanRank' && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                        )}
                                    </div>
                                </th>
                                <th style={styles.tableHeader}>LEAGUE</th>
                                <th style={styles.tableHeader} onClick={() => handleSort('name')}>
                                    <div style={styles.headerCell}>
                                        PLAYER
                                        {sortConfig.key === 'name' && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                        )}
                                    </div>
                                </th>
                                <th style={styles.tableHeader} onClick={() => handleSort('role')}>
                                    <div style={styles.headerCell}>
                                        ROLE
                                        {sortConfig.key === 'role' && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                        )}
                                    </div>
                                </th>
                                <th style={styles.tableHeader} onClick={() => handleSort('townHallLevel')}>
                                    <div style={styles.headerCell}>
                                        TH_LVL
                                        {sortConfig.key === 'townHallLevel' && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                        )}
                                    </div>
                                </th>
                                <th style={styles.tableHeader} onClick={() => handleSort('expLevel')}>
                                    <div style={styles.headerCell}>
                                        EXP
                                        {sortConfig.key === 'expLevel' && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                        )}
                                    </div>
                                </th>
                                <th style={styles.tableHeader} onClick={() => handleSort('donations')}>
                                    <div style={styles.headerCell}>
                                        DONATIONS
                                        {sortConfig.key === 'donations' && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((member, index) => (
                                <motion.tr
                                    key={member.tag}
                                    style={styles.tableRow}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                >
                                    <td style={styles.tableCell}>
                                        <span className="mono" style={styles.rankNumber}>#{member.clanRank}</span>
                                    </td>
                                    <td style={styles.tableCell}>
                                        {member.leagueTier?.iconUrls?.small && (
                                            <img
                                                src={member.leagueTier.iconUrls.small}
                                                alt={member.leagueTier.name}
                                                style={styles.leagueIcon}
                                                title={member.leagueTier.name}
                                            />
                                        )}
                                    </td>
                                    <td style={styles.tableCell}>
                                        <div style={styles.playerInfo}>
                                            <span style={styles.playerName}>{member.name}</span>
                                            <span className="mono" style={styles.playerTag}>{member.tag}</span>
                                        </div>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <span style={{ ...styles.roleBadge, color: getRoleColor(member.role) }}>
                                            {getRoleLabel(member.role)}
                                        </span>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <div style={styles.thCell}>
                                            {getTownHallImage(member.townHallLevel) ? (
                                                <img
                                                    src={getTownHallImage(member.townHallLevel)}
                                                    alt={`TH${member.townHallLevel}`}
                                                    style={styles.thIcon}
                                                    title={`Town Hall ${member.townHallLevel}`}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <Castle size={14} style={{ color: 'var(--rh-red)' }} />
                                            )}
                                            <span className="mono">{member.townHallLevel}</span>
                                        </div>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <span className="mono" style={styles.expLevel}>{member.expLevel}</span>
                                    </td>
                                    <td style={styles.tableCell}>
                                        <div style={styles.donationCell}>
                                            <span className="mono" style={{ color: '#10b981' }}>↑{member.donations}</span>
                                            <span className="mono" style={{ color: 'var(--text-muted)' }}>↓{member.donationsReceived}</span>
                                        </div>
                                    </td>

                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </section>
    );
};

const styles = {
    backNav: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'transparent',
        border: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.75rem',
        fontWeight: '600',
        letterSpacing: '0.05em',
        marginBottom: '2rem',
        transition: 'all 0.2s ease',
    },
    header: {
        background: 'linear-gradient(135deg, #1e1e1e 0%, #151515 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '2px',
        padding: '2rem',
        marginBottom: '2rem',
    },
    headerTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    techLabel: {
        fontSize: '0.7rem',
        color: 'var(--rh-red)',
        fontWeight: '700',
        letterSpacing: '0.15em',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.65rem',
        color: '#10b981',
        fontWeight: '700',
        letterSpacing: '0.05em',
    },
    pulsingDot: {
        width: '6px',
        height: '6px',
        background: '#10b981',
        borderRadius: '50%',
        animation: 'pulse 2s infinite',
    },
    headerMain: {
        display: 'flex',
        gap: '2rem',
        alignItems: 'flex-start',
    },
    badgeWrapper: {
        position: 'relative',
        width: '120px',
        height: '120px',
        flexShrink: 0,
    },
    clanBadge: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        position: 'relative',
        zIndex: 2,
    },
    badgeGlow: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100%',
        height: '100%',
        background: 'var(--rh-red)',
        borderRadius: '50%',
        filter: 'blur(30px)',
        opacity: 0.15,
        transform: 'translate(-50%, -50%)',
    },
    headerInfo: {
        flex: 1,
    },
    clanName: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#fff',
        margin: 0,
        marginBottom: '0.25rem',
    },
    clanTag: {
        fontSize: '0.875rem',
        color: 'var(--rh-red)',
        fontWeight: '500',
        display: 'block',
        marginBottom: '1rem',
    },
    description: {
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        lineHeight: '1.6',
        maxWidth: '600px',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '3rem',
    },
    statCard: {
        background: 'linear-gradient(135deg, #1e1e1e 0%, #151515 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '2px',
        padding: '1.25rem',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.65rem',
        color: 'var(--text-muted)',
        fontWeight: '700',
        letterSpacing: '0.1em',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    cardContent: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
    },
    statItem: {
        flex: '1 1 30%',
        minWidth: '60px',
    },
    statItemFull: {
        width: '100%',
        marginBottom: '0.5rem',
    },
    statLabel: {
        display: 'block',
        fontSize: '0.55rem',
        color: 'var(--text-muted)',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.25rem',
    },
    statValue: {
        fontSize: '1.125rem',
        fontWeight: '700',
        color: '#fff',
    },
    statValueSmall: {
        fontSize: '0.8rem',
        fontWeight: '600',
        color: '#fff',
    },
    membersSection: {
        background: 'linear-gradient(135deg, #1e1e1e 0%, #151515 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '2px',
        padding: '1.5rem',
    },
    membersHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    membersTitleArea: {
        borderLeft: '3px solid var(--rh-red)',
        paddingLeft: '1rem',
    },
    membersTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#fff',
        margin: '0.25rem 0 0 0',
    },
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--border-color)',
        padding: '0.5rem 1rem',
        minWidth: '250px',
    },
    searchInput: {
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.75rem',
        outline: 'none',
        flex: 1,
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeaderRow: {
        background: 'rgba(0,0,0,0.3)',
    },
    tableHeader: {
        textAlign: 'left',
        padding: '0.75rem 1rem',
        fontSize: '0.65rem',
        fontWeight: '700',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        borderBottom: '1px solid var(--border-color)',
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
    },
    headerCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    tableRow: {
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        transition: 'background 0.2s ease',
    },
    tableCell: {
        padding: '0.75rem 1rem',
        fontSize: '0.8125rem',
        color: 'var(--text-secondary)',
        verticalAlign: 'middle',
    },
    rankNumber: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        fontWeight: '600',
    },
    playerInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    playerName: {
        color: '#fff',
        fontWeight: '600',
    },
    playerTag: {
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
    },
    roleBadge: {
        fontSize: '0.65rem',
        fontWeight: '700',
        letterSpacing: '0.05em',
        fontFamily: 'JetBrains Mono, monospace',
    },
    thCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    thIcon: {
        width: '24px',
        height: '24px',
        objectFit: 'contain',
    },
    expLevel: {
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
    },
    donationCell: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        fontSize: '0.75rem',
    },
    leagueIcon: {
        width: '28px',
        height: '28px',
        objectFit: 'contain',
    },
    errorState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 2rem',
    },
    backButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
};

export default ClanDetail;
