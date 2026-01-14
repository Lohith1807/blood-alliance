import React, { createContext, useContext, useState, useEffect } from 'react';

// Import the cached clan data (fetched via node scripts/fetchClanData.js)
import clanData from '../../clan_data.json';

// Create the Clan Context
const ClanContext = createContext();

// Clan Context Provider
export const ClanProvider = ({ children }) => {
    const [clans, setClans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClan, setSelectedClan] = useState(null);

    // Load cached clan data on mount
    useEffect(() => {
        setLoading(true);

        try {
            if (Array.isArray(clanData) && clanData.length > 0) {
                setClans(clanData);
                console.log(`✅ Loaded ${clanData.length} clans from cached data`);
            } else {
                throw new Error('No clan data available');
            }
        } catch (err) {
            console.error('Error loading clan data:', err);
            setError(err.message);
            setClans([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get a specific clan by tag
    const getClanByTag = (tag) => {
        return clans.find(clan => clan.tag === tag) || null;
    };

    // Note: To refresh data, run locally: node scripts/fetchClanData.js
    const refreshClans = () => {
        console.log('ℹ️ To refresh clan data, run: node scripts/fetchClanData.js');
        console.log('Then commit and push the updated clan_data.json');
    };

    const value = {
        clans,
        loading,
        error,
        selectedClan,
        setSelectedClan,
        getClanByTag,
        refreshClans,
    };

    return (
        <ClanContext.Provider value={value}>
            {children}
        </ClanContext.Provider>
    );
};

// Custom hook to use ClanContext
export const useClans = () => {
    const context = useContext(ClanContext);
    if (!context) {
        throw new Error('useClans must be used within a ClanProvider');
    }
    return context;
};

export default ClanContext;
