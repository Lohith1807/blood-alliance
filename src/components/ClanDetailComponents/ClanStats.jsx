import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Swords, Trophy, Users, Activity } from 'lucide-react';
import styles from '@/css/ClanDetail.module.css';

const ClanStats = ({ clan }) => {
    return (
        <motion.div
            className={styles.statsGrid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            {/* Card 1: Clan Level & Points */}
            <div className={styles.statCard}>
                <div className={styles.cardHeader}>
                    <Shield size={16} style={{ color: 'var(--rh-red)' }} />
                    <span>Clan Stats</span>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Level</span>
                        <span className={`mono ${styles.statValue}`}>{clan.clanLevel}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Trophies</span>
                        <span className={`mono ${styles.statValue}`}>{clan.clanPoints?.toLocaleString()}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Clan Capital</span>
                        <span className={`mono ${styles.statValue}`}>{clan.clanCapitalPoints?.toLocaleString() || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Card 2: War Statistics */}
            <div className={styles.statCard}>
                <div className={styles.cardHeader}>
                    <Swords size={16} style={{ color: 'var(--rh-red)' }} />
                    <span>War Record</span>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Wins</span>
                        <span className={`mono ${styles.statValue}`} style={{ color: '#10b981' }}>{clan.warWins}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Losses</span>
                        <span className={`mono ${styles.statValue}`} style={{ color: '#ef4444' }}>{clan.warLosses}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Win Streak</span>
                        <span className={`mono ${styles.statValue}`}>{clan.warWinStreak}</span>
                    </div>
                </div>
            </div>

            {/* Card 3: League Information */}
            <div className={styles.statCard}>
                <div className={styles.cardHeader}>
                    <Trophy size={16} style={{ color: 'var(--rh-red)' }} />
                    <span>Leagues</span>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.statItemFull}>
                        <span className={styles.statLabel}>War League</span>
                        <span className={`mono ${styles.statValueSmall}`}>{clan.warLeague?.name || 'N/A'}</span>
                    </div>
                    <div className={styles.statItemFull}>
                        <span className={styles.statLabel}>Capital League</span>
                        <span className={`mono ${styles.statValueSmall}`}>{clan.capitalLeague?.name || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Card 4: Member Stats */}
            <div className={styles.statCard}>
                <div className={styles.cardHeader}>
                    <Users size={16} style={{ color: 'var(--rh-red)' }} />
                    <span>Members</span>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Count</span>
                        <span className={`mono ${styles.statValue}`}>{clan.members}/50</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Capacity</span>
                        <span className={`mono ${styles.statValue}`}>{Math.round((clan.members / 50) * 100)}%</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Clan Type</span>
                        <span className={`mono ${styles.statValueSmall}`}>{clan.type?.toUpperCase()}</span>
                    </div>
                </div>
            </div>

            {/* Card 5: War Frequency & Settings */}
            <div className={styles.statCard}>
                <div className={styles.cardHeader}>
                    <Activity size={16} style={{ color: 'var(--rh-red)' }} />
                    <span>Settings</span>
                </div>
                <div className={styles.cardContent}>
                    <div className={styles.statItemFull}>
                        <span className={styles.statLabel}>War Frequency</span>
                        <span className={`mono ${styles.statValue}`}>{clan.warFrequency?.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    <div className={styles.statItemFull}>
                        <span className={styles.statLabel}>Location</span>
                        <span className={`mono ${styles.statValueSmall}`}>{clan.location?.name || 'GLOBAL'}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ClanStats;
