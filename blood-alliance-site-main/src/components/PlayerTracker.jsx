import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Database, Loader2 } from 'lucide-react';
import styles from '@/css/PlayerTracker.module.css';

const PlayerTracker = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [clanFilter, setClanFilter] = useState('all');

    // Fetch players from API
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await fetch('/api/players');
                const data = await response.json();
                if (data.success) {
                    setPlayers(data.players);
                } else {
                    console.error('Failed to load players:', data.error);
                }
            } catch (error) {
                console.error('Error fetching players:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

    const clans = useMemo(() => {
        return ['all', ...new Set(players.map(p => p.assignedClanTag).filter(Boolean))];
    }, [players]);

    const getClanName = (tag) => {
        return players.find(p => p.assignedClanTag === tag)?.assignedClan || tag;
    };

    const filteredPlayers = useMemo(() => {
        return players.filter(p => {
            const haystack = [p.playerName, p.playerTag, p.username, p.userId, p.assignedClan, p.assignedClanTag]
                .filter(Boolean).join(" ").toLowerCase();
            const matchesSearch = searchTerm === "" || haystack.includes(searchTerm.toLowerCase());
            const matchesClan = clanFilter === 'all' || p.assignedClanTag === clanFilter;
            return matchesSearch && matchesClan;
        });
    }, [searchTerm, clanFilter, players]);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Loader2 size={48} style={{ color: 'var(--rh-red)' }} />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
            <header className={styles.headerBox}>
                <div className={styles.tagline}><Database size={14} /> SYSTEM_QUERY: CWL_REGISTRY</div>
                <h1 className={styles.title}>Blood Alliance CWL Info</h1>
                <p className={styles.subtitle}>
                    Check your Lazy CWL registration and assigned clan. Filtering active.
                </p>
            </header>

            <div className={styles.toolbar}>
                <div className={styles.searchCol}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search operative..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.filterCol}>
                    <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                    <select
                        value={clanFilter}
                        onChange={(e) => setClanFilter(e.target.value)}
                        className={styles.select}
                    >
                        <option value="all">All Squadrons</option>
                        {clans.filter(c => c !== 'all').map(tag => (
                            <option key={tag} value={tag}>{getClanName(tag)}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.statsBadge}>
                    {filteredPlayers.length} RECORDS FOUND
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <div className={styles.tableHeader}>
                    <div style={{ flex: 2 }}>OPERATIVE</div>
                    <div style={{ flex: 1.5 }}>SQUADRON / TAG</div>
                    <div style={{ flex: 1.5 }}>DISCORD PROTOCOL</div>
                    <div style={{ flex: 1, textAlign: 'right' }}>ACTIONS</div>
                </div>

                <AnimatePresence mode='popLayout'>
                    {filteredPlayers.map((player) => (
                        <motion.div
                            key={player.playerTag}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={styles.tableRow}
                        >
                            <div style={{ flex: 2 }}>
                                <div className={styles.pName}>{player.playerName}</div>
                                <div className={`mono ${styles.pTag}`}>{player.playerTag}</div>
                            </div>

                            <div style={{ flex: 1.5 }}>
                                <div className={styles.cName}>{player.assignedClan}</div>
                                <div className={`mono ${styles.cTag}`}>{player.assignedClanTag}</div>
                            </div>

                            <div style={{ flex: 1.5 }}>
                                <div className={styles.uName}>{player.username || 'N/A'}</div>
                                <div className={`mono ${styles.uId}`}>{player.userId ? `ID:${player.userId}` : ""}</div>
                            </div>

                            <div style={{ flex: 1, display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <a
                                    href={`https://link.clashofclans.com/?action=OpenPlayerProfile&tag=${encodeURIComponent(player.playerTag)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className={`btn btn-secondary ${styles.rowBtn}`}
                                >
                                    Profile
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredPlayers.length === 0 && (
                <div className={styles.emptyState}>
                    <p>NO MATCHING RECORDS IN REGISTRY</p>
                </div>
            )}
        </div>
    );
};

export default PlayerTracker;
