import React from 'react';
import { motion } from 'framer-motion';
import { Users, ExternalLink, ShieldCheck, Activity, BarChart3, Database, Loader2 } from 'lucide-react';
import { useClans } from '../context/ClanContext';
import '@/css/ClanList.css';

// Helper to get leader/co-leaders from memberList
const getLeaders = (memberList) => {
    if (!memberList) return { leader: 'Unknown', coLeaders: [] };
    const leader = memberList.find(m => m.role === 'leader');
    const coLeaders = memberList.filter(m => m.role === 'coLeader').map(m => m.name);
    return {
        leader: leader?.name || 'Unknown',
        coLeaders: coLeaders
    };
};

const ClanCard = ({ clan, index, onClanSelect }) => {
    const { leader, coLeaders } = getLeaders(clan.memberList);

    return (
        <motion.div
            className="clan-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: (index % 3) * 0.1,
                ease: [0.215, 0.61, 0.355, 1]
            }}
            viewport={{ once: true, margin: "-50px" }}
            onClick={() => onClanSelect && onClanSelect(clan.tag)}
        >
            <div className="unit-tag">
                UNIT_{String(index + 1).padStart(2, '0')}
            </div>
            {/* <div className="status-indicator">
                <div className="status-dot"></div>
                ACTIVE_OPS
            </div> */}

            <div className="main-content">
                <div className="badge-frame">
                    <img
                        src={clan.badgeUrls?.medium || clan.badgeUrls?.large}
                        alt={clan.name}
                        className="clan-badge"
                        onError={(e) => { e.target.src = 'https://api-assets.clashofclans.com/badges/200/empty.png'; }}
                    />
                    <div className="badge-glow"></div>
                </div>

                <div className="info-panel">
                    <h3 className="clan-title">{clan.name}</h3>
                    <span className="clan-hash mono">{clan.tag}</span>
                </div>
            </div>

            <div className="metrics-horizontal">
                <div className="metric-card">
                    <span className="metric-key">LEVEL</span>
                    <span className="metric-val mono">{clan.clanLevel}</span>
                </div>
                <div className="metric-card">
                    <span className="metric-key">MEMBERS</span>
                    <span className="metric-val mono">{clan.members}/50</span>
                </div>
                <div className="metric-card">
                    <span className="metric-key">WAR_WINS</span>
                    <span className="metric-val mono" style={{ color: '#10b981' }}>{clan.warWins}</span>
                </div>
            </div>

            <div className="hierarchy-box">
                <div className="hierarchy-label">
                    <ShieldCheck size={12} /> COMMAND_HIERARCHY
                </div>
                <div className="commander-text">
                    <span className="metric-key" style={{ fontSize: '0.6rem' }}>LEADER:</span> <span className="commander-name">{leader}</span>
                </div>
                <div className="commander-text" style={{ marginTop: '0.25rem' }}>
                    <span className="metric-key" style={{ fontSize: '0.6rem' }}>OPS:</span> {coLeaders.slice(0, 1).join(', ')}{coLeaders.length > 1 ? ` +${coLeaders.length - 1}` : ''}
                </div>
            </div>

            <button
                className="view-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onClanSelect && onClanSelect(clan.tag);
                }}
            >
                ANALYZE_UNIT <ExternalLink size={14} />
            </button>
        </motion.div>
    );
};

// Loading skeleton card
const SkeletonCard = ({ index }) => (
    <div className="clan-card skeleton-card">
        <div className="card-top" style={{ border: 'none' }}>
            <div className="unit-tag" style={{ opacity: 0.3 }}>LOADING...</div>
        </div>
        <div className="main-content">
            <div className="badge-frame" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
            <div className="info-panel">
                <div style={{ width: '120px', height: '18px', background: 'rgba(255,255,255,0.05)', marginBottom: '8px' }}></div>
                <div style={{ width: '80px', height: '12px', background: 'rgba(255,255,255,0.05)' }}></div>
            </div>
        </div>
    </div>
);

const ClanList = ({ onClanSelect }) => {
    const { clans, loading, error } = useClans();

    return (
        <section id="clans" className="container clan-list-section">
            <div className="section-header">
                <div className="tech-label mono">
                    <BarChart3 size={16} /> ANALYTICS_ENGINE // CLAN_REGISTRY
                </div>
                <h2 className="section-title">Alliance Strategic Units</h2>
                <p className="section-subtitle">
                    {loading
                        ? 'Establishing persistent uplink with Clash of Clans API...'
                        : `Real-time synchronization of ${clans.length} active squadrons within the Blood Alliance network. Access unit profile for deep-dive intelligence.`
                    }
                </p>
            </div>

            {error && (
                <div className="error-box" style={errorBoxStyle}>
                    <span style={{ color: 'var(--rh-red)', fontWeight: 'bold' }}>[CRITICAL_FAILURE]:</span> {error}
                </div>
            )}

            <div className="clan-grid">
                {loading ? (
                    [...Array(6)].map((_, index) => (
                        <SkeletonCard key={index} index={index} />
                    ))
                ) : (
                    clans.map((clan, index) => (
                        <ClanCard key={clan.tag} clan={clan} index={index} onClanSelect={onClanSelect} />
                    ))
                )}
            </div>
        </section>
    );
};

// Kept one minimal style object for error handling to avoid extra CSS rules
const errorBoxStyle = {
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '1.25rem',
    marginBottom: '2.5rem',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.8125rem',
    color: '#ef4444',
};

export default ClanList;
