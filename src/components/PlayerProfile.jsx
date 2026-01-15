import React, { useState, useEffect } from 'react';
import { Trophy, Users, Activity, Crown, Target } from 'lucide-react';
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
    getLoot,
    getProgress
} from '../utils/playerProfileUtils';

const PlayerProfile = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [apiBase, setApiBase] = useState(null); // Dynamic Base URL

    // 1. Fetch the Dynamic Tunnel URL on Mount
    useEffect(() => {
        const getBackendUrl = async () => {
            try {
                const res = await fetch('/api/get-connection'); // Ask Vercel: "Where is the backend?"
                const data = await res.json();
                if (data.url) {
                    console.log('Backend Located:', data.url);
                    setApiBase(data.url);

                    // 2. Init Session directly with Backend
                    try {
                        await fetch(`${data.url}/api/init`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include' // Important for Cookies
                        });
                        console.log('Session Init: SUCCESS');
                    } catch (e) {
                        console.warn('Session init warning:', e);
                    }
                }
            } catch (err) {
                console.error('Failed to get backend URL:', err);
                setError("System Error: Cannot locate backend server.");
            }
        };
        getBackendUrl();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;
        if (!apiBase) {
            setError("Backend connecting... please wait.");
            return;
        }

        let tag = searchTerm.trim();
        if (!tag.startsWith('#')) tag = '#' + tag;
        // User reports "Player Not Found" -> likely double encoding issue
        // Direct call to Express needs proper encoding of # to %23
        const encodedTag = encodeURIComponent(tag);

        setLoading(true);
        setError(null);
        setPlayerData(null);

        try {
            // DIRECT call to Cloudflare Tunnel (Bypassing Vercel Proxy)
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
            console.error(err);
            setError(err.message || 'Player not found or system error.');
        } finally {
            setLoading(false);
        }
    };

    // Data Preparation
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

    const lifetimeLoot = [
        { label: 'Gold Looted', value: getLoot(playerData, 'Gold Grab') },
        { label: 'Elixir Looted', value: getLoot(playerData, 'Elixir Escapade') },
        { label: 'Dark Elixir Looted', value: getLoot(playerData, 'Heroic Heist') },
    ];

    const personalRecords = [
        { label: 'Best Trophies', value: playerData?.bestTrophies, icon: <Trophy size={14} /> },
        { label: 'BB Hall Level', value: playerData?.builderHallLevel, icon: <Crown size={14} /> },
        { label: 'BB Best Trophies', value: playerData?.bestBuilderBaseTrophies, icon: <Target size={14} /> },
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
            <SearchForm
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleSearch={handleSearch}
            />

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

export default PlayerProfile;
