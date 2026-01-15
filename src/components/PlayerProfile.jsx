import React, { useState, useEffect } from 'react';
import { Search, Shield, Trophy, Star, Sword, BarChart2, Hash, Users, Activity, Zap, Crown, Target } from 'lucide-react';
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

// Utility for key mapping if needed
const cleanTag = (tag) => tag?.replace('#', '');

const PlayerProfile = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial Init
    useEffect(() => {
        console.log('Session Init: OK');
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;
        setLoading(true);
        setError(null);
        setPlayerData(null);

        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            // Load new mock data structure
            const mockModule = await import('../data/profile_data.json');

            if (mockModule.default && mockModule.default.success) {
                setPlayerData(mockModule.default.data);
            } else {
                throw new Error("Invalid Data Format");
            }
        } catch (err) {
            console.error(err);
            setError('Player not found or system error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>

            {/* SEARCH SECTION */}
            <div className={styles.searchSection}>
                <div className={styles.searchWrapper}>
                    <h1 className={styles.title}>
                        PLAYER <span className={styles.highlight}>LOOKUP</span>
                    </h1>

                    <form onSubmit={handleSearch} className={styles.form}>
                        <Search className={styles.inputIcon} size={20} />
                        <input
                            type="text"
                            placeholder="ENTER PLAYER TAG (e.g. #P0LYUQPLC)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                            className={styles.input}
                        />
                        <button type="submit" className={styles.searchBtn}>Analyze</button>
                    </form>
                    <div className={styles.systemStatus}>
                        System Ready • Secure Connection • v2.4.0
                    </div>
                </div>
            </div>

            {loading && (
                <div className={styles.loading}>
                    <Activity className={styles.highlight} size={32} />
                    <div className={styles.loadingText}>&gt; RETRIEVING PLAYER DOSSIER...</div>
                </div>
            )}

            {error && (
                <div className={styles.error}>
                    [ERROR] {error}
                </div>
            )}

            {playerData && (
                <div className={styles.grid}>

                    {/* LEFT COLUMN: Identity & Clan */}
                    <div className={styles.colStack}>

                        {/* Profile Card */}
                        <div className={`${styles.card} ${styles.cardRelative}`}>
                            <div className={styles.cardIconBg}>
                                <Hash size={64} />
                            </div>

                            <div className={styles.identityHeader}>
                                <div className={styles.leagueIconBox}>
                                    {/* MAIN PHOTO: Now the Town Hall */}
                                    <div className={styles.leagueIconWrapper}>
                                        {getTownHallImage(playerData.townHallLevel) ? (
                                            <img
                                                src={getTownHallImage(playerData.townHallLevel)}
                                                alt={`Town Hall ${playerData.townHallLevel}`}
                                                className={styles.leagueImg}
                                            />
                                        ) : (
                                            <Shield color="var(--text-muted)" size={40} />
                                        )}
                                    </div>

                                    {/* SECONDARY BADGE: Now the League Tier */}
                                    {playerData.leagueTier?.iconUrls?.medium ? (
                                        <div className={styles.thIconWrapper} title={playerData.leagueTier.name}>
                                            <img
                                                src={playerData.leagueTier.iconUrls.medium}
                                                alt={playerData.leagueTier.name}
                                                className={styles.thIcon}
                                            />
                                        </div>
                                    ) : (
                                        <div className={styles.thLabel}>
                                            TH{playerData.townHallLevel}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className={styles.playerName}>{playerData.name}</h2>
                                    <div className={styles.playerTag}>{playerData.tag}</div>
                                    <div className={styles.playerRole}>
                                        {playerData.role === 'leader' ? 'Leader' :
                                            playerData.role === 'coLeader' ? 'Co-Leader' :
                                                playerData.role === 'admin' ? 'Elder' : 'Member'}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.statsGrid}>
                                <StatBox label="Level" value={playerData.expLevel} />
                                <StatBox label="Trophies" value={playerData.trophies} />
                                <StatBox label="Best" value={playerData.bestTrophies} />
                                <StatBox label="War Stars" value={playerData.warStars} highlight />
                            </div>
                        </div>

                        {/* Clan Card */}
                        <div className={styles.card}>
                            <h3 className={styles.sectionTitleSmall}>
                                <Shield size={14} /> Clan Alignment
                            </h3>
                            {playerData.clan ? (
                                <div className={styles.clanFlex}>
                                    <img src={playerData.clan.badgeUrls?.medium} alt="Clan" className={styles.clanBadge} />
                                    <div>
                                        <div className={styles.clanName}>{playerData.clan.name}</div>
                                        <div className={styles.clanInfo}>
                                            Lvl {playerData.clan.clanLevel} • {playerData.clan.tag}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.clanInfo} style={{ fontStyle: 'italic' }}>No Clan Affiliation</div>
                            )}

                            <div className={styles.donationGrid}>
                                <div className={styles.donationBox}>
                                    <div className={styles.donationLabel}>Donated</div>
                                    <div className={`${styles.donationValue} ${styles.accent}`}>{playerData.donations}</div>
                                </div>
                                <div className={styles.donationBox}>
                                    <div className={styles.donationLabel}>Received</div>
                                    <div className={styles.donationValue}>{playerData.donationsReceived}</div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Details */}
                    <div className={styles.colStack}>

                        {/* Heroes & Equipment Grid */}
                        <div className={styles.colStack}>
                            <SectionHeader title="Heroes & Equipment" icon={Crown} />
                            <div className={styles.heroGrid}>
                                {playerData.heroes?.filter(h => h.village === 'home').map((hero, idx) => (
                                    <div key={idx} className={styles.heroCard}>
                                        <div className={styles.heroHeader}>
                                            <span className={styles.heroName}>{hero.name}</span>
                                            <span className={styles.heroLevel}>Lvl {hero.level}</span>
                                        </div>
                                        {/* Equipment */}
                                        <div className={styles.equipRow}>
                                            {hero.equipment?.map((eq, i) => (
                                                <div key={i} className={styles.equipBox} title={eq.name}>
                                                    <div className={styles.equipName}>{eq.name}</div>
                                                    <div className={styles.equipLevel}>{eq.level}</div>
                                                </div>
                                            ))}
                                            {(!hero.equipment || hero.equipment.length === 0) && (
                                                <div className={styles.noEquip}>No Equipment</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Spells & Troops Summary */}
                        <div className={styles.splitGrid}>

                            {/* Spells */}
                            <div>
                                <SectionHeader title="S.P.E.L.L.S" icon={Zap} />
                                <div className={styles.card}>
                                    <div className={styles.spellsWrapper}>
                                        {playerData.spells?.filter(s => s.village === 'home').map((spell, idx) => (
                                            <div key={idx} className={styles.spellTag}>
                                                <span className={styles.spellName}>{spell.name}</span>
                                                <span className={styles.spellLevel}>{spell.level}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Achievements (Top 4) */}
                            <div>
                                <SectionHeader title="Recent Achievements" icon={Target} />
                                <div className={styles.card}>
                                    <div className={styles.achievementList}>
                                        {playerData.achievements?.filter(a => a.village === 'home' && a.stars > 0).slice(0, 4).map((ach, idx) => (
                                            <div key={idx} className={styles.achievementItem}>
                                                <span className={styles.achievementName}>{ach.name}</span>
                                                <div className={styles.stars}>
                                                    {[...Array(ach.stars)].map((_, i) => <Star key={i} size={8} fill="currentColor" />)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

const SectionHeader = ({ title, icon: Icon }) => (
    <div className={styles.sectionHeader}>
        <Icon size={16} className={styles.sectionHeaderIcon} />
        <h4 className={styles.sectionHeaderTitle}>{title}</h4>
    </div>
);

const StatBox = ({ label, value, highlight = false }) => (
    <div className={styles.statBox}>
        <div className={styles.statLabel}>{label}</div>
        <div className={`${styles.statValue} ${highlight ? styles.highlight : ''}`}>
            {value?.toLocaleString() || '-'}
        </div>
    </div>
);

export default PlayerProfile;
