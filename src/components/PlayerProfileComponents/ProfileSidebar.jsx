import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { getLeagueIcon } from '../../utils/playerProfileUtils';
import styles from '../../css/PlayerProfile.module.css';

const ProfileSidebar = ({ playerData, progressStats, itemVariants }) => (
    <motion.div variants={itemVariants} className={styles.sidebar}>
        <div className={styles.thHeroSection}>
            <div className={styles.thHeroImageWrapper}>
                {getLeagueIcon(playerData) ? (
                    <>
                        <img src={getLeagueIcon(playerData)} alt="League" className={styles.sidebarThImg} />
                        <div className={styles.leagueName}> {(playerData.league || playerData.leagueTier)?.name}</div>
                    </>
                ) : (
                    <Shield size={48} color="#EE0000" />
                )}
            </div>
        </div>

        <div className={styles.progressBox}>
            <div className={styles.progressHeader}>PROGRESSION_STATUS</div>
            {progressStats.map((stat, i) => (
                <div key={i} className={styles.progItem}>
                    <div className={styles.progLabel}>{stat.label.toUpperCase()}</div>
                    <div className={styles.progBarBg}>
                        <div className={styles.progBarFill} style={{ width: `${stat.value}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
);

export default ProfileSidebar;
