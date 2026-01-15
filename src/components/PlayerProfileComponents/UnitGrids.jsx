import { getUnitImage } from '../../utils/playerProfileUtils';
import styles from '../../css/PlayerProfile.module.css';

const UnitCard = ({ unit }) => {
    const isMax = unit.level === unit.maxLevel;

    return (
        <div className={styles.troopCard} title={`${unit.name} (Lvl ${unit.level}/${unit.maxLevel})`}>
            {getUnitImage(unit.name) ? (
                <img src={getUnitImage(unit.name)} alt={unit.name} className={styles.troopImg} />
            ) : (
                <div className={styles.troopInitials}>{unit.name.substring(0, 2).toUpperCase()}</div>
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
