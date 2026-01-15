import React from 'react';
import { motion } from 'framer-motion';
import { getTownHallImage } from '../../utils/playerProfileUtils';
import styles from '../../css/PlayerProfile.module.css';

const ProfileHeader = ({ playerData, itemVariants }) => (
    <motion.div variants={itemVariants} className={styles.detailsCard}>
        <div className={styles.playerSection}>
            <div className={styles.leagueIconWrapper}>
                <img src={getTownHallImage(playerData.townHallLevel)} alt="TH" className={styles.leagueImg} />
            </div>
            <div className={styles.playerMainInfo}>
                <div className={styles.nameHeader}>
                    <h1 className={styles.profileName}>{playerData.name}</h1>
                    <div className={styles.expLevel}>EXP {playerData.expLevel}</div>
                </div>
                <div className={styles.profileTag}>{playerData.tag}</div>
                <div className={styles.badgeRow}>
                    <div className={styles.thBadge}>TH {playerData.townHallLevel}</div>
                    <div className={styles.warPrefBadge} data-pref={playerData.warPreference}>
                        WAR: {playerData.warPreference?.toUpperCase()}
                    </div>
                </div>
            </div>
        </div>

        <div className={styles.clanSection}>
            {playerData.clan ? (
                <>
                    <div className={styles.clanCardBadge}>
                        <img src={playerData.clan.badgeUrls?.medium} alt="Clan" className={styles.clanBadgeImg} />
                    </div>
                    <div className={styles.clanNameInfo}>
                        <div className={styles.clanCardName}>{playerData.clan.name}</div>
                        <div className={styles.playerRole}>
                            {playerData.role === 'leader' ? 'Leader' :
                                playerData.role === 'coLeader' ? 'Co-Leader' :
                                    playerData.role === 'admin' ? 'Elder' : 'Member'}
                        </div>
                    </div>
                </>
            ) : (
                <div className={styles.noClanText}>Independent Contractor (No Clan)</div>
            )}
        </div>

        <div className={styles.quickStatsSection}>
            <div className={styles.statMini}>
                <div className={styles.miniLabel}>ATTACK WINS</div>
                <div className={styles.miniValue}>{playerData.attackWins || 0}</div>
            </div>
            <div className={styles.statMini}>
                <div className={styles.miniLabel}>DEFENSE WINS</div>
                <div className={styles.miniValue}>{playerData.defenseWins || 0}</div>
            </div>
            <div className={styles.statMini}>
                <div className={styles.miniLabel}>CAPITAL CONTRIB.</div>
                <div className={styles.miniValue}>{playerData.clanCapitalContributions?.toLocaleString()}</div>
            </div>
        </div>
    </motion.div>
);

export default ProfileHeader;
