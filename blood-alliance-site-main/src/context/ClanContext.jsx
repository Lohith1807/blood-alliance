import React, { createContext, useContext, useState, useEffect } from 'react';

// Import the local cached data as fallback
import cachedClanData from '../../clan_data.json';

// Create the Clan Context
const ClanContext = createContext();

// Clan Context Provider
export const ClanProvider = ({ children }) => {
    const [clans, setClans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClan, setSelectedClan] = useState(null);
    const [dataSource, setDataSource] = useState('loading'); // 'api' | 'cache' | 'loading'

    // Load data on mount - use cached JSON data (API blocked by CORS)
    useEffect(() => {
        const loadClanData = async () => {
            setLoading(true);
            setError(null);

            try {
                // The COC API blocks browser requests (CORS), so we use the cached data
                // The cached data was previously fetched using the Node.js script
                if (Array.isArray(cachedClanData) && cachedClanData.length > 0) {
                    setClans(cachedClanData);
                    setDataSource('cache');
                    console.log(`✅ Loaded ${cachedClanData.length} clans from cached data`);
                } else {
                    throw new Error('No cached clan data available');
                }
            } catch (err) {
                console.error('Error loading clan data:', err);
                setError(err.message);
                setClans([]);
            } finally {
                setLoading(false);
            }
        };

        loadClanData();
    }, []);

    // Get a specific clan by tag
    const getClanByTag = (tag) => {
        return clans.find(clan => clan.tag === tag) || null;
    };

    // Note: To refresh data, run the Node.js script:
    // node scripts/fetchClanData.js
    const refreshClans = async () => {
        console.log('⚠️ To refresh clan data, run: node scripts/fetchClanData.js');
        console.log('Browser cannot fetch directly from COC API due to CORS restrictions.');
        // Reload from cached data
        if (Array.isArray(cachedClanData)) {
            setClans(cachedClanData);
        }
    };

    const value = {
        clans,
        loading,
        error,
        selectedClan,
        setSelectedClan,
        getClanByTag,
        refreshClans,
        dataSource,
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
