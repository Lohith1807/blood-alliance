import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Swords, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClans } from '../context/ClanContext';
import '@/css/ClanList.css';

const ClanCard = ({ clan, index }) => {
    const navigate = useNavigate();

    const handleClanClick = () => {
        // Strip '#' from tag for cleaner URL -> opens full ClanDetail overview
        navigate(`/clan/${clan.tag.replace('#', '')}`);
    };

    return (
        <motion.div
            className="clan-card clan-card-compact"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.22,
                delay: (index % 3) * 0.03,
                ease: "easeOut"
            }}
            viewport={{ once: true, margin: "-20px" }}
            onClick={handleClanClick}
            title={`View ${clan.name} full overview`}
        >
            <div className="compact-badge-wrap">
                <img
                    src={clan.badgeUrls?.medium || clan.badgeUrls?.large}
                    alt={clan.name}
                    className="compact-badge"
                    onError={(e) => { e.target.src = 'https://api-assets.clashofclans.com/badges/200/empty.png'; }}
                />
            </div>

            <div className="compact-info">
                <div className="compact-top-row">
                    <h3 className="compact-clan-name">{clan.name}</h3>
                    <span className="compact-lvl-pill">Lvl {clan.clanLevel}</span>
                    <span className={`compact-type-pill ${clan.clanType === 'WAR' ? 'compact-type-war' : 'compact-type-fwa'}`}>
                        {clan.clanType || 'FWA'}
                    </span>
                </div>

                <div className="compact-stats-row">
                    <span className="compact-stat" title="Members">
                        <span className="compact-green-dot" />
                        <span>{clan.members}/50</span>
                    </span>
                    <span className="compact-stat" title="Wars Won">
                        <Swords size={13} color="#f59e0b" />
                        <span>{clan.warWins?.toLocaleString?.() ?? clan.warWins}</span>
                    </span>
                    <span className="compact-stat" title="Clan Trophies">
                        <Trophy size={12} color="#fbbf24" />
                        <span>{clan.clanPoints?.toLocaleString?.() ?? clan.clanPoints}</span>
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

// Loading skeleton card
const SkeletonCard = () => (
    <div className="clan-card clan-card-compact skeleton-card">
        <div className="compact-badge-wrap" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div className="compact-info">
            <div style={{ width: '130px', height: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', marginBottom: '8px' }} />
            <div style={{ width: '170px', height: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }} />
        </div>
    </div>
);

const ClanList = () => {
    const { clans, loading, error } = useClans();

    return (
        <section id="clans" className="container clan-list-section">
            <div className="section-header">
                <div className="tech-label">
                    <BarChart3 size={14} /> Our Family
                </div>
                <h2 className="section-title">Alliance Clans</h2>
                <p className="section-subtitle">
                    {loading
                        ? 'Loading clans...'
                        : `${clans.length} active clans — click any clan for full details.`
                    }
                </p>
            </div>

            {error && (
                <div className="error-box" style={errorBoxStyle}>
                    <span style={{ color: 'var(--rh-red)', fontWeight: 'bold' }}>Error:</span> {error}
                </div>
            )}

            <div className="clan-grid">
                {loading ? (
                    [...Array(6)].map((_, index) => (
                        <SkeletonCard key={index} index={index} />
                    ))
                ) : (
                    clans.map((clan, index) => (
                        <ClanCard key={clan.tag} clan={clan} index={index} />
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
