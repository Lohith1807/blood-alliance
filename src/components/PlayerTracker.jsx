import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Database, Loader2, RotateCw } from 'lucide-react';
import styles from '@/css/PlayerTracker.module.css';
import CONFIG from '@/config';

const PlayerTracker = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [clanFilter, setClanFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const fetchPlayers = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        
        try {
            const response = await fetch('https://zvbtdnywdmfffxvxgzso.supabase.co/functions/v1/registrations-list');
            const data = await response.json();
            if (data.success) {
                // Map API fields to component structure
                const mappedPlayers = (data.items || []).map(item => ({
                    playerTag: item.player_tag,
                    playerName: item.player_name,
                    assignedClanTag: item.assigned_clan_tag || '',
                    assignedClan: item.assigned_clan_name || 'Unassigned',
                    username: item.discord_username || 'N/A',
                    userId: item.discord_user_id,
                    registeredAt: item.registered_at
                }));
                setPlayers(mappedPlayers);
            } else {
                console.error('Failed to load players:', data.error);
            }
        } catch (error) {
            console.error('Error fetching players:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
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
                <div className={styles.tagline}><Database size={14} /> CWL Registry</div>
                <h1 className={styles.title}>{CONFIG.meta.title} CWL Info</h1>
                <p className={styles.subtitle}>
                    Check your Lazy CWL registration and assigned clan. Filtering active.
                </p>
            </header>

            <div className={styles.toolbar}>
                <div className={styles.searchCol}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search ..."
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
                        <option value="all">All Clans</option>
                        {clans.filter(c => c !== 'all').map(tag => (
                            <option key={tag} value={tag}>{getClanName(tag)}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.statsBadge}>
                    {filteredPlayers.length} records found
                </div>

                <button 
                    className={`${styles.refreshBtn} ${refreshing ? styles.spinning : ''}`}
                    onClick={() => fetchPlayers(true)}
                    disabled={loading || refreshing}
                    title="Refresh Data"
                >
                    <RotateCw size={14} />
                </button>
            </div>

            <div className={styles.tableWrapper}>
                <div className={styles.tableHeader}>
                    <div style={{ flex: 2 }}>Player Name</div>
                    <div style={{ flex: 1.5 }}>Assigned Clan</div>
                    <div style={{ flex: 1.5 }}>Discord Info</div>
                    <div style={{ flex: 1.2, textAlign: 'right' }}>Registered At</div>
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
                            </div>

                            <div style={{ flex: 1.5 }}>
                                {player.assignedClanTag ? (
                                    <a 
                                        href={`https://link.clashofclans.com/?action=OpenClanProfile&tag=${encodeURIComponent(player.assignedClanTag)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className={styles.clanLink}
                                    >
                                        <div className={styles.cName}>{player.assignedClan}</div>
                                        <div className={`mono ${styles.cTag}`}>{player.assignedClanTag}</div>
                                    </a>
                                ) : (
                                    <div className={styles.cName}>{player.assignedClan}</div>
                                )}
                            </div>

                            <div style={{ flex: 1.5 }}>
                                <div className={styles.uName}>{player.username}</div>
                                <div className={`mono ${styles.uId}`}>{player.userId ? `ID:${player.userId}` : ""}</div>
                            </div>

                            <div style={{ flex: 1.2, textAlign: 'right' }}>
                                <div className={styles.regDate}>
                                    {player.registeredAt ? new Date(player.registeredAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    }) : 'N/A'}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredPlayers.length === 0 && (
                <div className={styles.emptyState}>
                    <p>No matching records found</p>
                </div>
            )}
        </div>
    );
};

export default PlayerTracker;
