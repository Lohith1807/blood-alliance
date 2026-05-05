import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Users, Activity, Crown, Target, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../css/PlayerProfile.module.css';

// Modular Components
import SearchForm from './PlayerProfileComponents/SearchForm';
import ProfileHeader from './PlayerProfileComponents/ProfileHeader';
import ProfileSidebar from './PlayerProfileComponents/ProfileSidebar';
import ProfileStatsCards from './PlayerProfileComponents/ProfileStatsCards';
import { UnitSection } from './PlayerProfileComponents/UnitGrids';

// Utilities
import {
    siegeMachineNames,
    petNames,
    orderedElixirTroopNames,
    orderedDarkTroopNames,
    orderedElixirSpellNames,
    orderedDarkSpellNames,
    getLoot,
    getProgress
} from '../utils/playerProfileUtils';

const fullTroopOrder = [...orderedElixirTroopNames, ...orderedDarkTroopNames];
const fullSpellOrder = [...orderedElixirSpellNames, ...orderedDarkSpellNames];

const PlayerProfile = () => {
    const { playerTag } = useParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [apiBase, setApiBase] = useState(null); // Dynamic Base URL
    const [refreshing, setRefreshing] = useState(false); // New State for refresh UI

    // Function to get/refresh backend URL
    const getBackendUrl = async (force = false) => {
        try {
            if (force) setRefreshing(true);

            const res = await fetch(`/api/get-connection${force ? '?force=true' : ''}`);
            const data = await res.json();

            if (data.url) {
                setApiBase(data.url);

                // 2. Init Session directly with Backend
                try {
                    await fetch(`${data.url}/api/init`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include'
                    });
                } catch (e) {
                    // Silent fail
                }
            } else {
                throw new Error("No URL returned from DB");
            }
        } catch (err) {
            setError("System Error: Cannot locate backend server.");
        } finally {
            if (force) setRefreshing(false);
        }
    };

    // 1. Fetch the Dynamic Tunnel URL on Mount
    useEffect(() => {
        getBackendUrl();
    }, []);

    // Manual Refresh Handler
    const handleRefresh = (e) => {
        e.preventDefault();
        getBackendUrl(true);
    };

    const fetchPlayer = async (tag) => {
        if (!tag) return;
        if (!apiBase) {
            setError("Backend connecting... please wait.");
            return;
        }

        let formattedTag = tag.trim().toUpperCase();
        formattedTag = formattedTag.replace(/O/g, '0');
        if (!formattedTag.startsWith('#')) formattedTag = '#' + formattedTag;

        const encodedTag = encodeURIComponent(formattedTag);

        setLoading(true);
        setError(null);
        setPlayerData(null);

        try {
            const response = await fetch(`${apiBase}/game/player/${encodedTag}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
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
            setError(err.message || 'Player not found or system error.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchPlayer(searchTerm);
    };

    // Auto-fetch if playerTag is present in URL
    useEffect(() => {
        if (playerTag && apiBase) {
            fetchPlayer(playerTag);
        } else if (!playerTag) {
            // Reset state when navigating back to search page
            setPlayerData(null);
            setSearchTerm('');
        }
    }, [playerTag, apiBase]);

    // Data Preparation
    const heroesList = playerData?.heroes?.filter(h => h.village === 'home') || [];
    const spellsList = (playerData?.spells?.filter(s => s.village === 'home') || []).sort((a, b) => {
        const indexA = fullSpellOrder.indexOf(a.name);
        const indexB = fullSpellOrder.indexOf(b.name);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
    const siegeList = playerData?.troops?.filter(t => t.village === 'home' && siegeMachineNames.includes(t.name)) || [];
    const petsList = playerData?.troops?.filter(t => t.village === 'home' && petNames.includes(t.name)) || [];
    const troopsList = (playerData?.troops?.filter(t =>
        t.village === 'home' &&
        !t.name.startsWith('Super ') &&
        !siegeMachineNames.includes(t.name) &&
        !petNames.includes(t.name) &&
        !['Sneaky Goblin', 'Rocket Balloon', 'Inferno Dragon', 'Ice Hound'].includes(t.name) &&
        !t.superTroopIsActive
    ) || []).sort((a, b) => {
        const indexA = fullTroopOrder.indexOf(a.name);
        const indexB = fullTroopOrder.indexOf(b.name);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    const lifetimeLoot = [
        { label: 'Gold Looted', value: getLoot(playerData, 'Gold Grab') },
        { label: 'Elixir Looted', value: getLoot(playerData, 'Elixir Escapade') },
        { label: 'Dark Elixir Looted', value: getLoot(playerData, 'Heroic Heist') },
    ];

    const personalRecords = [
        { label: 'Best Trophies', value: playerData?.bestTrophies, icon: <Trophy size={14} /> },
        { label: 'Builder Hall', value: playerData?.builderHallLevel, icon: <Crown size={14} /> },
        { label: 'Builder Base Best', value: playerData?.bestBuilderBaseTrophies, icon: <Target size={14} /> },
        { label: 'Donations', value: playerData?.donations, icon: <Users size={14} /> },
    ];

    const progressStats = [
        { label: 'Buildings', value: 85 },
        { label: 'Supercharges', value: 30 },
        { label: 'Crafted Defenses', value: 60 },
        { label: 'Laboratory', value: getProgress(troopsList) },
        { label: 'Heroes', value: getProgress(heroesList) },
        { label: 'Equipment', value: 45 },
        { label: 'Pets', value: getProgress(petsList) },
        { label: 'Walls', value: 92 },
    ];

    // Animation Variants
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
            {playerTag && (
                <motion.button
                    onClick={() => navigate(-1)}
                    className={styles.backNav}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: -5 }}
                >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                </motion.button>
            )}

            {!playerTag && (
                <SearchForm
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    handleSearch={handleSearch}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                />
            )}

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
                        <div className={styles.loadingText}>&gt; Loading player data...</div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.error}
                    >
                        Error: {error}
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
                        <ProfileHeader playerData={playerData} itemVariants={itemVariants} />

                        <div className={styles.mainGrid}>
                            <ProfileSidebar
                                playerData={playerData}
                                progressStats={progressStats}
                                itemVariants={itemVariants}
                            />

                            <motion.div variants={itemVariants} className={styles.content}>
                                <ProfileStatsCards
                                    personalRecords={personalRecords}
                                    lifetimeLoot={lifetimeLoot}
                                />

                                <UnitSection title="Troops" list={troopsList} />

                                <div className={styles.bottomRow}>
                                    <div className={styles.rowItem}>
                                        <UnitSection title="Spells" list={spellsList} />
                                    </div>
                                    <div className={styles.rowItem}>
                                        <UnitSection title="Siege Machines" list={siegeList} />
                                    </div>
                                </div>

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

export default PlayerProfile;
