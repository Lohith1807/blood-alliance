import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, ChevronUp, ChevronDown, Castle } from 'lucide-react';
import styles from '@/css/ClanDetail.module.css';

// Town Hall image mapping - using weserv.nl proxy to bypass CORS
const getTownHallImage = (level) => {
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

const ClanMembersTable = ({ memberList }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'clanRank', direction: 'asc' });

    // Role hierarchy priority (lower number = higher rank)
    const getRolePriority = (role) => {
        switch (role) {
            case 'leader': return 1;
            case 'coLeader': return 2;
            case 'admin': return 3;
            case 'member': return 4;
            default: return 5;
        }
    };

    const filteredMembers = useMemo(() => {
        if (!memberList) return [];

        let members = [...memberList];

        if (searchTerm) {
            members = members.filter(member =>
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.tag.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        members.sort((a, b) => {
            let aVal, bVal;

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
    }, [memberList, searchTerm, sortConfig]);

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

    return (
        <motion.div
            className={styles.membersSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <div className={styles.membersHeader}>
                <div className={styles.membersTitleArea}>
                    <div className={`mono ${styles.techLabel}`}>
                        <Database size={14} /> MEMBER_REGISTRY
                    </div>
                    <h2 className={styles.membersTitle}>Active Personnel ({filteredMembers.length})</h2>
                </div>

                <div className={styles.searchContainer}>
                    <Search size={14} style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="SEARCH_MEMBER..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr className={styles.tableHeaderRow}>
                            <th className={styles.tableHeader} onClick={() => handleSort('clanRank')}>
                                <div className={styles.headerCell}>
                                    RANK
                                    {sortConfig.key === 'clanRank' && (
                                        sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                    )}
                                </div>
                            </th>
                            <th className={styles.tableHeader}>LEAGUE</th>
                            <th className={styles.tableHeader} onClick={() => handleSort('name')}>
                                <div className={styles.headerCell}>
                                    PLAYER
                                    {sortConfig.key === 'name' && (
                                        sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                    )}
                                </div>
                            </th>
                            <th className={styles.tableHeader} onClick={() => handleSort('role')}>
                                <div className={styles.headerCell}>
                                    ROLE
                                    {sortConfig.key === 'role' && (
                                        sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                    )}
                                </div>
                            </th>
                            <th className={styles.tableHeader} onClick={() => handleSort('townHallLevel')}>
                                <div className={styles.headerCell}>
                                    TH_LVL
                                    {sortConfig.key === 'townHallLevel' && (
                                        sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                    )}
                                </div>
                            </th>
                            <th className={styles.tableHeader} onClick={() => handleSort('expLevel')}>
                                <div className={styles.headerCell}>
                                    EXP
                                    {sortConfig.key === 'expLevel' && (
                                        sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                    )}
                                </div>
                            </th>
                            <th className={styles.tableHeader} onClick={() => handleSort('donations')}>
                                <div className={styles.headerCell}>
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
                                className={styles.tableRow}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <td className={styles.tableCell}>
                                    <span className={`mono ${styles.rankNumber}`}>#{member.clanRank}</span>
                                </td>
                                <td className={styles.tableCell}>
                                    {member.leagueTier?.iconUrls?.small && (
                                        <img
                                            src={member.leagueTier.iconUrls.small}
                                            alt={member.leagueTier.name}
                                            className={styles.leagueIcon}
                                            title={member.leagueTier.name}
                                        />
                                    )}
                                </td>
                                <td className={styles.tableCell}>
                                    <div className={styles.playerInfo}>
                                        <span className={styles.playerName}>{member.name}</span>
                                        <span className={`mono ${styles.playerTag}`}>{member.tag}</span>
                                    </div>
                                </td>
                                <td className={styles.tableCell}>
                                    <span style={{ color: getRoleColor(member.role) }} className={styles.roleBadge}>
                                        {getRoleLabel(member.role)}
                                    </span>
                                </td>
                                <td className={styles.tableCell}>
                                    <div className={styles.thCell}>
                                        {getTownHallImage(member.townHallLevel) ? (
                                            <img
                                                src={getTownHallImage(member.townHallLevel)}
                                                alt={`TH${member.townHallLevel}`}
                                                className={styles.thIcon}
                                                title={`Town Hall ${member.townHallLevel}`}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <Castle size={14} style={{ color: 'var(--rh-red)' }} />
                                        )}
                                        <span className="mono">{member.townHallLevel}</span>
                                    </div>
                                </td>
                                <td className={styles.tableCell}>
                                    <span className={`mono ${styles.expLevel}`}>{member.expLevel}</span>
                                </td>
                                <td className={styles.tableCell}>
                                    <div className={styles.donationCell}>
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
    );
};

export default ClanMembersTable;
