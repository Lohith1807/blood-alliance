import React from 'react';
import { motion } from 'framer-motion';
import { Users, ExternalLink, ShieldCheck, Activity, BarChart3, Database, Loader2 } from 'lucide-react';
import { useClans } from '../context/ClanContext';

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
            style={cardStyle}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, borderColor: 'var(--rh-red)' }}
            onClick={() => onClanSelect && onClanSelect(clan.tag)}
        >
            {/* Technical Header */}
            <div style={cardTop}>
                <div style={unitId}>
                    <Database size={12} /> UNIT_SQUADRON_{String(index + 1).padStart(2, '0')}
                </div>
                <div style={statusWrapper}>
                    <div style={pulsingDot}></div>
                    <span style={statusLabel}>ACTIVE_OPS</span>
                </div>
            </div>

            <div style={mainContent}>
                <div style={badgeContainer}>
                    <img
                        src={clan.badgeUrls?.medium || clan.badgeUrls?.large}
                        alt={clan.name}
                        style={badge}
                        onError={(e) => { e.target.src = 'https://api-assets.clashofclans.com/badges/200/empty.png'; }}
                    />
                    <div style={badgeOverlay}></div>
                </div>

                <div style={infoContent}>
                    <div style={titleRow}>
                        <h3 style={clanName}>{clan.name}</h3>
                        <span className="mono" style={clanTag}>{clan.tag}</span>
                    </div>

                    <div style={metricsGrid}>
                        <div style={metricBox}>
                            <span style={metricLabel}>STRATEGIC_LVL</span>
                            <span className="mono" style={metricValue}>{clan.clanLevel}</span>
                        </div>
                        <div style={metricBox}>
                            <span style={metricLabel}>RECRUIT_SYNC</span>
                            <span className="mono" style={metricValue}>{clan.members}/50</span>
                        </div>
                        <div style={metricBox}>
                            <span style={metricLabel}>WAR_WINS</span>
                            <span className="mono" style={{ ...metricValue, color: '#10b981' }}>{clan.warWins}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={divider}></div>

            <div style={managementSection}>
                <div style={managementHeader}>
                    <ShieldCheck size={12} /> <span style={managementLabel}>COMMAND_HIERARCHY</span>
                </div>
                <div style={leadersRow}>
                    <div style={leaderItem}>
                        <strong style={leaderTitle}>COMMANDER:</strong> {leader}
                    </div>
                    <div style={leaderItem}>
                        <strong style={leaderTitle}>EXECUTIVES:</strong> {coLeaders.slice(0, 2).join(', ')}{coLeaders.length > 2 ? '...' : ''}
                    </div>
                </div>
            </div>

            <button
                className="btn btn-secondary"
                style={actionBtn}
                onClick={(e) => {
                    e.stopPropagation();
                    onClanSelect && onClanSelect(clan.tag);
                }}
            >
                VIEW_DETAILS <ExternalLink size={12} />
            </button>
        </motion.div>
    );
};

// Loading skeleton card
const SkeletonCard = ({ index }) => (
    <motion.div
        style={{ ...cardStyle, animation: 'pulse 1.5s infinite' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 }}
    >
        <div style={cardTop}>
            <div style={{ ...unitId, opacity: 0.3 }}>
                <Database size={12} /> LOADING...
            </div>
        </div>
        <div style={mainContent}>
            <div style={{ ...badgeContainer, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
            <div style={{ ...infoContent }}>
                <div style={{ width: '150px', height: '20px', background: 'rgba(255,255,255,0.05)', marginBottom: '8px' }}></div>
                <div style={{ width: '100px', height: '14px', background: 'rgba(255,255,255,0.05)' }}></div>
            </div>
        </div>
    </motion.div>
);

const ClanList = ({ onClanSelect }) => {
    const { clans, loading, error } = useClans();

    return (
        <section id="clans" className="container" style={{ padding: '6rem 0' }}>
            <div style={sectionHeader}>
                <div className="mono" style={techLabel}>
                    <BarChart3 size={14} /> ANALYTICS_ENGINE: CLAN_REGISTRY
                </div>
                <h2 style={sectionTitle}>Alliance Strategic Units</h2>
                <p style={sectionSubtitle}>
                    {loading
                        ? 'Fetching real-time data from Clash of Clans API...'
                        : `Real-time status of ${clans.length} active squadrons within the Blood Alliance Ana network. Click a unit to view detailed intel.`
                    }
                </p>
            </div>

            {error && (
                <div style={errorBox}>
                    <span style={{ color: 'var(--rh-red)' }}>ERROR:</span> {error}
                </div>
            )}

            <div style={grid}>
                {loading ? (
                    // Show skeleton loaders while fetching
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

const techLabel = {
    fontSize: '0.7rem',
    color: 'var(--rh-red)',
    fontWeight: '700',
    letterSpacing: '0.15em',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
};

const sectionHeader = {
    marginBottom: '4rem',
    borderLeft: '3px solid var(--rh-red)',
    paddingLeft: '1.5rem',
};

const sectionTitle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.5rem',
    letterSpacing: '-0.02em',
};

const sectionSubtitle = {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    maxWidth: '500px',
};

const errorBox = {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '1rem',
    marginBottom: '2rem',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.8rem',
};

const grid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
};

const cardStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '2px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    background: 'linear-gradient(135deg, #1e1e1e 0%, #151515 100%)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
};

const cardTop = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
};

const unitId = {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.65rem',
    color: 'var(--rh-red)',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
};

const statusWrapper = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
};

const pulsingDot = {
    width: '6px',
    height: '6px',
    background: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
};

const statusLabel = {
    fontSize: '0.6rem',
    color: '#10b981',
    fontWeight: '700',
    letterSpacing: '0.05em',
};

const mainContent = {
    display: 'flex',
    gap: '1.25rem',
    marginBottom: '1.5rem',
};

const badgeContainer = {
    position: 'relative',
    width: '64px',
    height: '64px',
    flexShrink: 0,
};

const badge = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    zIndex: 2,
    position: 'relative',
};

const badgeOverlay = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    background: 'var(--rh-red)',
    borderRadius: '50%',
    filter: 'blur(20px)',
    opacity: 0.1,
    transform: 'translate(-50%, -50%)',
};

const infoContent = {
    flex: 1,
};

const titleRow = {
    marginBottom: '0.75rem',
};

const clanName = {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
};

const clanTag = {
    fontSize: '0.75rem',
    color: 'var(--rh-red)',
    fontWeight: '500',
};

const metricsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
};

const metricBox = {
    background: 'rgba(0,0,0,0.3)',
    padding: '0.5rem',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
};

const metricLabel = {
    fontSize: '0.55rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
    textTransform: 'uppercase',
};

const metricValue = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
};

const divider = {
    height: '1px',
    background: 'var(--border-color)',
    margin: '0.5rem 0 1.25rem 0',
    opacity: 0.5,
};

const managementSection = {
    marginBottom: '1.5rem',
};

const managementHeader = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-muted)',
    marginBottom: '0.75rem',
};

const managementLabel = {
    fontSize: '0.65rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const leadersRow = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
};

const leaderItem = {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
};

const leaderTitle = {
    color: 'var(--text-muted)',
    fontSize: '0.7rem',
    fontWeight: '600',
};

const actionBtn = {
    width: '100%',
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    height: '36px',
    gap: '8px',
    border: '1px solid var(--border-color)',
    background: 'rgba(255,255,255,0.03)',
};

export default ClanList;
