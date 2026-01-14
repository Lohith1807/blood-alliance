import React, { useState, useMemo } from 'react';
import playersData from '../data/players.json';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Database } from 'lucide-react';

const PlayerTracker = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [clanFilter, setClanFilter] = useState('all');

    const clans = useMemo(() => {
        return ['all', ...new Set(playersData.map(p => p.assignedClanTag).filter(Boolean))];
    }, []);

    const getClanName = (tag) => {
        return playersData.find(p => p.assignedClanTag === tag)?.assignedClan || tag;
    };

    const filteredPlayers = useMemo(() => {
        return playersData.filter(p => {
            const haystack = [p.playerName, p.playerTag, p.username, p.userId, p.assignedClan, p.assignedClanTag]
                .filter(Boolean).join(" ").toLowerCase();
            const matchesSearch = searchTerm === "" || haystack.includes(searchTerm.toLowerCase());
            const matchesClan = clanFilter === 'all' || p.assignedClanTag === clanFilter;
            return matchesSearch && matchesClan;
        });
    }, [searchTerm, clanFilter]);

    return (
        <div className="container" style={{ paddingTop: 'calc(var(--nav-height) + 2rem)' }}>
            <header style={headerBox}>
                <div style={tagline}><Database size={14} /> SYSTEM_QUERY: CWL_REGISTRY</div>
                <h1 style={titleStyle}>Blood Alliance CWL Info</h1>
                <p style={subtitleStyle}>
                    Check your Lazy CWL registration and assigned clan. Filtering active.
                </p>
            </header>

            <div style={toolbarStyle}>
                <div style={searchCol}>
                    <Search size={16} style={searchIcon} />
                    <input
                        type="text"
                        placeholder="Search operative..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                <div style={filterCol}>
                    <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                    <select
                        value={clanFilter}
                        onChange={(e) => setClanFilter(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="all">All Squadrons</option>
                        {clans.filter(c => c !== 'all').map(tag => (
                            <option key={tag} value={tag}>{getClanName(tag)}</option>
                        ))}
                    </select>
                </div>

                <div style={statsBadge}>
                    {filteredPlayers.length} RECORDS FOUND
                </div>
            </div>

            <div style={tableWrapper}>
                <div style={tableHeader}>
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
                            style={tableRow}
                        >
                            <div style={{ flex: 2 }}>
                                <div style={pName}>{player.playerName}</div>
                                <div className="mono" style={pTag}>{player.playerTag}</div>
                            </div>

                            <div style={{ flex: 1.5 }}>
                                <div style={cName}>{player.assignedClan}</div>
                                <div className="mono" style={cTag}>{player.assignedClanTag}</div>
                            </div>

                            <div style={{ flex: 1.5 }}>
                                <div style={uName}>{player.username || 'N/A'}</div>
                                <div className="mono" style={uId}>{player.userId ? `ID:${player.userId}` : ""}</div>
                            </div>

                            <div style={{ flex: 1, display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <a
                                    href={`https://link.clashofclans.com/?action=OpenPlayerProfile&tag=${encodeURIComponent(player.playerTag)}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="btn btn-secondary" style={rowBtn}
                                >
                                    Profile
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredPlayers.length === 0 && (
                <div style={emptyState}>
                    <p>NO MATCHING RECORDS IN REGISTRY</p>
                </div>
            )}
        </div>
    );
};

// Styles
const headerBox = { marginBottom: '2rem' };

const tagline = {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.7rem',
    color: 'var(--rh-red)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '0.5rem',
    fontWeight: '700',
};

const titleStyle = { fontSize: '1.5rem', marginBottom: '0.5rem' };
const subtitleStyle = { fontSize: '0.875rem', color: 'var(--text-muted)' };

const toolbarStyle = {
    display: 'flex',
    gap: '1rem',
    background: 'var(--bg-secondary)',
    padding: '0.75rem 1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '2px',
    marginBottom: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap',
};

const searchCol = { position: 'relative', flex: 1, minWidth: '200px' };
const searchIcon = { position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' };

const inputStyle = {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    padding: '0.4rem 0.5rem 0.4rem 2.2rem',
    fontSize: '0.85rem',
    color: '#fff',
    borderRadius: '2px',
};

const filterCol = { display: 'flex', alignItems: 'center', gap: '0.5rem' };
const selectStyle = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: '#fff',
    fontSize: '0.85rem',
    padding: '0.4rem',
    borderRadius: '2px',
};

const statsBadge = {
    fontSize: '0.7rem',
    fontFamily: 'JetBrains Mono, monospace',
    padding: '0.25rem 0.5rem',
    border: '1px solid var(--rh-red)',
    color: 'var(--rh-red)',
    fontWeight: '800',
};

const tableWrapper = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '2px',
};

const tableHeader = {
    display: 'flex',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border-color)',
    fontSize: '0.7rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
};

const tableRow = {
    display: 'flex',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--border-color)',
    alignItems: 'center',
    transition: 'background 0.2s ease',
};

const pName = { fontSize: '0.9rem', fontWeight: '700' };
const pTag = { fontSize: '0.75rem', color: 'var(--rh-red)' };
const cName = { fontSize: '0.85rem', fontWeight: '600' };
const cTag = { fontSize: '0.7rem', color: 'var(--text-muted)' };
const uName = { fontSize: '0.85rem' };
const uId = { fontSize: '0.7rem', color: 'var(--text-muted)' };

const rowBtn = { height: '28px', padding: '0 0.5rem', fontSize: '0.75rem' };

const emptyState = { padding: '3rem', textAlign: 'center', background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace' };

export default PlayerTracker;
