import React from 'react';
import Lottie from 'lottie-react';
import { getUnitImage } from '../../utils/playerProfileUtils';
import styles from '../../css/PlayerProfile.module.css';

const UnitCard = ({ unit }) => {
    const isMax = unit.level === unit.maxLevel;
    const fireAnimationUrl = "https://lottie.host/85a81e9f-85f2-4e01-9a75-23c280620fa6/mD5OQYtHyo.json";

    return (
        <div className={styles.troopCard} title={`${unit.name} (Lvl ${unit.level}/${unit.maxLevel})`}>
            {getUnitImage(unit.name) ? (
                <img src={getUnitImage(unit.name)} alt={unit.name} className={styles.troopImg} />
            ) : (
                <div className={styles.troopInitials}>{unit.name.substring(0, 2).toUpperCase()}</div>
            )}

            {isMax && (
                <div className={styles.lottieFireContainer}>
                    <Lottie
                        animationData={null}
                        path={fireAnimationUrl}
                        loop={true}
                        className={styles.lottieFire}
                    />
                </div>
            )}

            <div className={`${styles.troopLevel} ${isMax ? styles.troopLevelMax : ''}`}>
                {unit.level}
            </div>
        </div>
    );
};

export const UnitSection = ({ title, list }) => {
    if (!list || list.length === 0) return null;
    return (
        <div className={styles.unitCategory}>
            <div className={styles.unitCategoryTitle}>{title}</div>
            <div className={styles.unitGrid}>
                {list.map((unit, idx) => (
                    <UnitCard key={idx} unit={unit} />
                ))}
            </div>
        </div>
    );
};

export default UnitCard;
