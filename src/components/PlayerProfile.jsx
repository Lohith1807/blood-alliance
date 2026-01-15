import React, { useState, useEffect } from 'react';
import { Search, Shield, Trophy, Star, Sword, BarChart2, Hash, Users, Activity, Zap, Crown, Target } from 'lucide-react';
import Lottie from 'lottie-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../css/PlayerProfile.module.css';

// Town Hall image mapping - using weserv.nl proxy to bypass CORS
const getTownHallImage = (level) => {
    const baseProxy = 'https://images.weserv.nl/?url=';
    const townHallImages = {
        1: 'static.wikia.nocookie.net/clashofclans/images/f/fd/Town_Hall1.png/revision/latest/scale-to-width-down/200',
        2: 'static.wikia.nocookie.net/clashofclans/images/7/7d/Town_Hall2.png/revision/latest/scale-to-width-down/200',
        3: 'static.wikia.nocookie.net/clashofclans/images/d/dd/Town_Hall3.png/revision/latest/scale-to-width-down/200',
        4: 'static.wikia.nocookie.net/clashofclans/images/e/e7/Town_Hall4.png/revision/latest/scale-to-width-down/200',
        5: 'static.wikia.nocookie.net/clashofclans/images/a/a3/Town_Hall5.png/revision/latest/scale-to-width-down/200',
        6: 'static.wikia.nocookie.net/clashofclans/images/5/52/Town_Hall6.png/revision/latest/scale-to-width-down/200',
        7: 'static.wikia.nocookie.net/clashofclans/images/7/75/Town_Hall7.png/revision/latest/scale-to-width-down/200',
        8: 'static.wikia.nocookie.net/clashofclans/images/f/fa/Town_Hall8.png/revision/latest/scale-to-width-down/200',
        9: 'static.wikia.nocookie.net/clashofclans/images/e/e0/Town_Hall9.png/revision/latest/scale-to-width-down/200',
        10: 'static.wikia.nocookie.net/clashofclans/images/5/5c/Town_Hall10.png/revision/latest/scale-to-width-down/200',
        11: 'static.wikia.nocookie.net/clashofclans/images/9/96/Town_Hall11.png/revision/latest/scale-to-width-down/200',
        12: 'static.wikia.nocookie.net/clashofclans/images/b/b7/Town_Hall12.png/revision/latest/scale-to-width-down/200',
        13: 'static.wikia.nocookie.net/clashofclans/images/7/73/Town_Hall13.png/revision/latest/scale-to-width-down/200',
        14: 'static.wikia.nocookie.net/clashofclans/images/b/b6/Town_Hall14.png/revision/latest/scale-to-width-down/200',
        15: 'static.wikia.nocookie.net/clashofclans/images/d/d4/Town_Hall15.png/revision/latest/scale-to-width-down/200',
        16: 'static.wikia.nocookie.net/clashofclans/images/5/53/Town_Hall16.png/revision/latest/scale-to-width-down/200',
        17: 'static.wikia.nocookie.net/clashofclans/images/2/24/Town_Hall17-1.png/revision/latest/scale-to-width-down/200',
        18: 'static.wikia.nocookie.net/clashofclans/images/7/76/Town_Hall18.png/revision/latest/scale-to-width-down/200',
    };
    return townHallImages[level] ? `${baseProxy}${townHallImages[level]}` : null;
};

// Unit image mapping
const getUnitImage = (name) => {
    const baseProxy = 'https://images.weserv.nl/?url=';
    const images = {
        // Heroes
        'Barbarian King': 'static.wikia.nocookie.net/clashofclans/images/2/26/Avatar_Hero_Barbarian_King.png',
        'Archer Queen': 'static.wikia.nocookie.net/clashofclans/images/b/b6/Avatar_Hero_Archer_Queen.png',
        'Grand Warden': 'static.wikia.nocookie.net/clashofclans/images/1/1d/Avatar_Hero_Grand_Warden.png',
        'Royal Champion': 'static.wikia.nocookie.net/clashofclans/images/8/8e/Avatar_Hero_Royal_Champion.png',
        'Minion Prince': 'static.wikia.nocookie.net/clashofclans/images/1/17/Avatar_Hero_Minion_Prince.png',

        // Troops
        'Barbarian': 'static.wikia.nocookie.net/clashofclans/images/8/87/Avatar_Barbarian.png',
        'Archer': 'static.wikia.nocookie.net/clashofclans/images/6/68/Avatar_Archer.png',
        'Giant': 'static.wikia.nocookie.net/clashofclans/images/7/7d/Avatar_Giant.png',
        'Goblin': 'static.wikia.nocookie.net/clashofclans/images/6/68/Avatar_Goblin.png',
        'Wall Breaker': 'static.wikia.nocookie.net/clashofclans/images/3/36/Avatar_Wall_Breaker.png',
        'Balloon': 'static.wikia.nocookie.net/clashofclans/images/8/80/Avatar_Balloon.png',
        'Wizard': 'static.wikia.nocookie.net/clashofclans/images/9/97/Avatar_Wizard.png',
        'Healer': 'static.wikia.nocookie.net/clashofclans/images/9/9c/Avatar_Healer.png',
        'Dragon': 'static.wikia.nocookie.net/clashofclans/images/9/9c/Avatar_Dragon.png',
        'P.E.K.K.A': 'static.wikia.nocookie.net/clashofclans/images/1/1a/Avatar_P.E.K.K.A.png',
        'Baby Dragon': 'static.wikia.nocookie.net/clashofclans/images/7/7a/Avatar_Baby_Dragon.png',
        'Miner': 'static.wikia.nocookie.net/clashofclans/images/7/7a/Avatar_Miner.png',
        'Electro Dragon': 'static.wikia.nocookie.net/clashofclans/images/9/97/Avatar_Electro_Dragon.png',
        'Yeti': 'static.wikia.nocookie.net/clashofclans/images/b/be/Avatar_Yeti.png',
        'Dragon Rider': 'static.wikia.nocookie.net/clashofclans/images/5/50/Avatar_Dragon_Rider.png',
        'Electro Titan': 'static.wikia.nocookie.net/clashofclans/images/6/67/Avatar_Electro_Titan.png',
        'Root Rider': 'static.wikia.nocookie.net/clashofclans/images/0/0b/Avatar_Root_Rider.png',
        'Thrower': 'static.wikia.nocookie.net/clashofclans/images/d/da/Avatar_Thrower.png',
        'Meteor Golem': 'static.wikia.nocookie.net/clashofclans/images/0/01/Avatar_Meteor_Golem.png',
        'Minion': 'static.wikia.nocookie.net/clashofclans/images/3/3b/Avatar_Minion.png',
        'Hog Rider': 'static.wikia.nocookie.net/clashofclans/images/e/e9/Avatar_Hog_Rider.png',
        'Valkyrie': 'static.wikia.nocookie.net/clashofclans/images/3/31/Avatar_Valkyrie.png',
        'Golem': 'static.wikia.nocookie.net/clashofclans/images/4/44/Avatar_Golem.png',
        'Witch': 'static.wikia.nocookie.net/clashofclans/images/9/90/Avatar_Witch.png',
        'Lava Hound': 'static.wikia.nocookie.net/clashofclans/images/1/1b/Avatar_Lava_Hound.png',
        'Bowler': 'static.wikia.nocookie.net/clashofclans/images/2/24/Avatar_Bowler.png',
        'Ice Golem': 'static.wikia.nocookie.net/clashofclans/images/7/79/Avatar_Ice_Golem.png',
        'Headhunter': 'static.wikia.nocookie.net/clashofclans/images/8/80/Avatar_Headhunter.png',
        'Apprentice Warden': 'static.wikia.nocookie.net/clashofclans/images/8/8b/Avatar_Apprentice_Warden.png',
        'Druid': 'static.wikia.nocookie.net/clashofclans/images/4/43/Avatar_Druid.png',
        'Furnace': 'static.wikia.nocookie.net/clashofclans/images/e/e0/Avatar_Furnace.png',

        // Spells
        'Lightning Spell': 'static.wikia.nocookie.net/clashofclans/images/c/c0/Lightning_Spell_info.png',
        'Healing Spell': 'static.wikia.nocookie.net/clashofclans/images/f/f2/Healing_Spell_info.png',
        'Rage Spell': 'static.wikia.nocookie.net/clashofclans/images/8/8a/Rage_Spell_info.png',
        'Jump Spell': 'static.wikia.nocookie.net/clashofclans/images/3/38/Jump_Spell_info.png',
        'Freeze Spell': 'static.wikia.nocookie.net/clashofclans/images/e/ef/Freeze_Spell_info.png',
        'Invisibility Spell': 'static.wikia.nocookie.net/clashofclans/images/a/a3/Invisibility_Spell_info.png',
        'Recall Spell': 'static.wikia.nocookie.net/clashofclans/images/7/73/Recall_Spell_info.png',
        'Revive Spell': 'static.wikia.nocookie.net/clashofclans/images/5/5f/Revive_Spell_info.png',
        'Totem Spell': 'static.wikia.nocookie.net/clashofclans/images/d/d1/Totem_Spell_info.png',
        'Clone Spell': 'static.wikia.nocookie.net/clashofclans/images/9/91/Clone_Spell_info.png',
        'Poison Spell': 'static.wikia.nocookie.net/clashofclans/images/4/49/Poison_Spell_info.png',
        'Earthquake Spell': 'static.wikia.nocookie.net/clashofclans/images/3/3f/Earthquake_Spell_info.png',
        'Haste Spell': 'static.wikia.nocookie.net/clashofclans/images/b/be/Haste_Spell_info.png',
        'Skeleton Spell': 'static.wikia.nocookie.net/clashofclans/images/0/0f/Skeleton_Spell_info.png',
        'Bat Spell': 'static.wikia.nocookie.net/clashofclans/images/3/3d/Bat_Spell_info.png',
        'Overgrowth Spell': 'static.wikia.nocookie.net/clashofclans/images/a/a6/Overgrowth_Spell_info.png',
        'Ice Block Spell': 'static.wikia.nocookie.net/clashofclans/images/6/66/Ice_Block_Spell_info.png',

        // Siege Machines
        'Wall Wrecker': 'static.wikia.nocookie.net/clashofclans/images/f/f3/Avatar_Wall_Wrecker.png',
        'Battle Blimp': 'static.wikia.nocookie.net/clashofclans/images/2/2f/Avatar_Battle_Blimp.png',
        'Stone Slammer': 'static.wikia.nocookie.net/clashofclans/images/a/ad/Avatar_Stone_Slammer.png',
        'Siege Barracks': 'static.wikia.nocookie.net/clashofclans/images/f/fe/Avatar_Siege_Barracks.png',
        'Log Launcher': 'static.wikia.nocookie.net/clashofclans/images/7/73/Avatar_Log_Launcher.png',
        'Flame Flinger': 'static.wikia.nocookie.net/clashofclans/images/e/e4/Avatar_Flame_Flinger.png',
        'Battle Drill': 'static.wikia.nocookie.net/clashofclans/images/9/99/Avatar_Battle_Drill.png',
        'Troop Launcher': 'static.wikia.nocookie.net/clashofclans/images/0/08/Avatar_Troop_Launcher.png',

        // Pets
        'L.A.S.S.I': 'static.wikia.nocookie.net/clashofclans/images/6/62/Avatar_L.A.S.S.I.png',
        'Electro Owl': 'static.wikia.nocookie.net/clashofclans/images/6/6e/Avatar_Electro_Owl.png',
        'Mighty Yak': 'static.wikia.nocookie.net/clashofclans/images/0/03/Avatar_Mighty_Yak.png',
        'Unicorn': 'static.wikia.nocookie.net/clashofclans/images/a/ac/Avatar_Unicorn.png',
        'Frosty': 'static.wikia.nocookie.net/clashofclans/images/e/e6/Avatar_Frosty.png',
        'Diggy': 'static.wikia.nocookie.net/clashofclans/images/6/6b/Avatar_Diggy.png',
        'Poison Lizard': 'static.wikia.nocookie.net/clashofclans/images/a/aa/Avatar_Poison_Lizard.png',
        'Phoenix': 'static.wikia.nocookie.net/clashofclans/images/4/4f/Avatar_Phoenix.png',
        'Spirit Fox': 'static.wikia.nocookie.net/clashofclans/images/5/52/Avatar_Spirit_Fox.png',
        'Angry Jelly': 'static.wikia.nocookie.net/clashofclans/images/3/3a/Avatar_Angry_Jelly.png',
        'Sneezy': 'static.wikia.nocookie.net/clashofclans/images/9/96/Avatar_Sneezy.png',
    };
    return images[name] ? `${baseProxy}${images[name]}/revision/latest/scale-to-width-down/120` : null;
};

// Utility for key mapping if needed
const cleanTag = (tag) => tag?.replace('#', '');

// Robust League Icon Fetcher
const getLeagueIcon = (playerData) => {
    if (!playerData) return null;
    const leagueData = playerData.league || playerData.leagueTier;
    if (!leagueData || !leagueData.iconUrls) return null;

    // Fallback order: medium -> large -> small
    return leagueData.iconUrls.medium ||
        leagueData.iconUrls.large ||
        leagueData.iconUrls.small;
};

const PlayerProfile = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const API_BASE = "http://api-blood-alliance.duckdns.org:30267";

    // Initial Init to establish session/cookies
    useEffect(() => {
        const initSession = async () => {
            try {
                await fetch(`${API_BASE}/api/init`, {
                    method: 'POST',
                    headers: {
                        'Origin': API_BASE,
                        'Content-Type': 'application/json'
                    },
                    mode: 'cors',
                    credentials: 'include'
                });
                console.log('Session Init: SUCCESS');
            } catch (err) {
                console.error('Session Init Error:', err);
            }
        };
        initSession();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;

        let tag = searchTerm.trim();
        if (!tag.startsWith('#')) tag = '#' + tag;
        const encodedTag = tag.replace('#', '%23');

        setLoading(true);
        setError(null);
        setPlayerData(null);

        try {
            const response = await fetch(`${API_BASE}/game/player/${encodedTag}`, {
                headers: {
                    'Origin': API_BASE
                },
                mode: 'cors',
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 404) throw new Error("Player not found.");
                throw new Error("Failed to fetch player data.");
            }

            const result = await response.json();
            if (result.success) {
                setPlayerData(result.data);
            } else {
                throw new Error(result.message || "Invalid Data Format");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Player not found or system error.');
        } finally {
            setLoading(false);
        }
    };

    if (!playerData && !loading && !error) {
        return (
            <div className={styles.container}>
                <SearchForm searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearch={handleSearch} />
            </div>
        );
    }

    // Category Lists & Filtering
    const siegeMachineNames = ['Wall Wrecker', 'Battle Blimp', 'Stone Slammer', 'Siege Barracks', 'Log Launcher', 'Flame Flinger', 'Battle Drill', 'Troop Launcher', 'Root Rider']; // Siege/Special
    const petNames = ['L.A.S.S.I', 'Electro Owl', 'Mighty Yak', 'Unicorn', 'Frosty', 'Diggy', 'Poison Lizard', 'Phoenix', 'Spirit Fox', 'Angry Jelly', 'Sneezy'];

    const heroesList = playerData?.heroes?.filter(h => h.village === 'home') || [];
    const spellsList = playerData?.spells?.filter(s => s.village === 'home') || [];
    const siegeList = playerData?.troops?.filter(t => t.village === 'home' && siegeMachineNames.includes(t.name)) || [];
    const petsList = playerData?.troops?.filter(t => t.village === 'home' && petNames.includes(t.name)) || [];
    const troopsList = playerData?.troops?.filter(t =>
        t.village === 'home' &&
        !t.name.startsWith('Super ') &&
        !siegeMachineNames.includes(t.name) &&
        !petNames.includes(t.name) &&
        !['Sneaky Goblin', 'Rocket Balloon', 'Inferno Dragon', 'Ice Hound'].includes(t.name) &&
        !t.superTroopIsActive
    ) || [];

    // Extract Lifetime Loot from Achievements
    const getLoot = (name) => {
        const achievement = playerData?.achievements?.find(a => a.name === name);
        return achievement ? achievement.value : 0;
    };

    const lifetimeLoot = [
        { label: 'Gold Looted', value: getLoot('Gold Grab') },
        { label: 'Elixir Looted', value: getLoot('Elixir Escapade') },
        { label: 'Dark Elixir Looted', value: getLoot('Heroic Heist') },
    ];

    const personalRecords = [
        { label: 'Best Trophies', value: playerData?.bestTrophies, icon: <Trophy size={14} /> },
        { label: 'BB Hall Level', value: playerData?.builderHallLevel, icon: <Crown size={14} /> },
        { label: 'BB Best Trophies', value: playerData?.bestBuilderBaseTrophies, icon: <Target size={14} /> },
        { label: 'Donations', value: playerData?.donations, icon: <Users size={14} /> },
    ];

    // Derive Progress (Mocked for VISUALS as per reference image)
    const getProgress = (list) => {
        if (!list || list.length === 0) return 0;
        const maxed = list.filter(i => i.level === i.maxLevel).length;
        return Math.round((maxed / list.length) * 100);
    };

    const progressStats = [
        { label: 'Buildings', value: 85 }, // Mocked or derived from TH
        { label: 'Supercharges', value: 30 },
        { label: 'Crafted Defenses', value: 60 },
        { label: 'Laboratory', value: getProgress(troopsList) },
        { label: 'Heroes', value: getProgress(heroesList) },
        { label: 'Equipment', value: 45 },
        { label: 'Pets', value: getProgress(petsList) },
        { label: 'Walls', value: 92 },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <div className={styles.container}>
            <SearchForm searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearch={handleSearch} />

            <AnimatePresence mode="wait">
                {loading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.loading}
                    >
                        <Activity className={styles.highlight} size={32} />
                        <div className={styles.loadingText}>&gt; RETRIEVING PLAYER DOSSIER...</div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.error}
                    >
                        [ERROR] {error}
                    </motion.div>
                )}

                {playerData && !loading && (
                    <motion.div
                        key="profile"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={styles.profileContent}
                    >
                        {/* TOP SECTION: PLAYER & CLAN DETAILS CARD */}
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

                        <div className={styles.mainGrid}>
                            {/* LEFT SIDEBAR: TH & PROGRESS */}
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

                            {/* RIGHT CONTENT: STATS & UNIT GRIDS */}
                            <motion.div variants={itemVariants} className={styles.content}>
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

                                <UnitSection title="Troops" list={troopsList} />
                                <UnitSection title="Spells" list={spellsList} />
                                <UnitSection title="Siege Machines" list={siegeList} />

                                <div className={styles.bottomRow}>
                                    <div className={styles.rowItem}>
                                        <UnitSection title="Heroes / Guardians" list={heroesList} />
                                    </div>
                                    <div className={styles.rowItem}>
                                        <UnitSection title="Hero Pets" list={petsList} />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SearchForm = ({ searchTerm, setSearchTerm, handleSearch }) => (
    <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
            <h1 className={styles.title}>
                PLAYER <span className={styles.highlight}>LOOKUP</span>
            </h1>
            <form onSubmit={handleSearch} className={styles.form}>
                <Search className={styles.inputIcon} size={20} />
                <input
                    type="text"
                    placeholder="ENTER PLAYER TAG"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    className={styles.input}
                />
                <button type="submit" className={styles.searchBtn}>Analyze</button>
            </form>
            <div className={styles.systemStatus}>System Ready • v2.4.0</div>
        </div>
    </div>
);

const UnitSection = ({ title, list }) => {
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

const StatBox = ({ label, value, highlight = false }) => (
    <div className={styles.statBox}>
        <div className={styles.statLabel}>{label.toUpperCase()}</div>
        <div className={`${styles.statValue} ${highlight ? styles.statHighlight : ''}`}>
            {value?.toLocaleString() || '-'}
        </div>
    </div>
);

export default PlayerProfile;
