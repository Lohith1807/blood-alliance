import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import styles from '@/css/ClanDetail.module.css';

const ClanHeader = ({ clan }) => {
    return (
        <motion.div
            className={styles.header}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
        >
            <div className={styles.headerTop}>
                <div className={`mono ${styles.techLabel}`}>
                    <BarChart3 size={14} /> UNIT_PROFILE: {clan.tag}
                </div>
                <div className={styles.statusBadge}>
                    <div className={styles.pulsingDot}></div>
                    <span>ONLINE</span>
                </div>
            </div>

            <div className={styles.headerMain}>
                <div className={styles.badgeWrapper}>
                    <img
                        src={clan.badgeUrls?.large || clan.badgeUrls?.medium}
                        alt={clan.name}
                        className={styles.clanBadge}
                        onError={(e) => { e.target.src = 'https://api-assets.clashofclans.com/badges/200/empty.png'; }}
                    />
                    <div className={styles.badgeGlow}></div>
                </div>
                <div className={styles.headerInfo}>
                    <h1 className={styles.clanName}>{clan.name}</h1>
                    <span className={`mono ${styles.clanTag}`}>{clan.tag}</span>
                    <p className={styles.description}>{clan.description}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default ClanHeader;
