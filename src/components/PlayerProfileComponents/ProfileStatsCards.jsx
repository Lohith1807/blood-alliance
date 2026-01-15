import React from 'react';
import styles from '../../css/PlayerProfile.module.css';

const ProfileStatsCards = ({ personalRecords, lifetimeLoot }) => (
    <div className={styles.recordsGrid}>
        <div className={styles.recordsCard}>
            <div className={styles.recordsTitle}>PERSONAL RECORDS</div>
            <div className={styles.recordsList}>
                {personalRecords.map((rec, i) => (
                    <div key={i} className={styles.recordItem}>
                        <div className={styles.recordIcon}>{rec.icon}</div>
                        <div className={styles.recordLabel}>{rec.label}</div>
                        <div className={styles.recordValue}>{rec.value?.toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
        <div className={styles.recordsCard}>
            <div className={styles.recordsTitle}>LIFETIME LOOT</div>
            <div className={styles.recordsList}>
                {lifetimeLoot.map((loot, i) => (
                    <div key={i} className={styles.recordItem}>
                        <div className={styles.recordLabel}>{loot.label}</div>
                        <div className={styles.recordValue}>{loot.value?.toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default ProfileStatsCards;
