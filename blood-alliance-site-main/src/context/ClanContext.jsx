import React, { createContext, useContext, useState, useEffect } from 'react';

// Import the local cached data as fallback
import cachedClanData from '../../clan_data.json';

// Create the Clan Context
const ClanContext = createContext();

// API endpoint - Vercel serverless function fetching from MongoDB
const API_ENDPOINT = '/api/clans';

// Clan Context Provider
export const ClanProvider = ({ children }) => {
    const [clans, setClans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClan, setSelectedClan] = useState(null);
    const [dataSource, setDataSource] = useState('loading'); // 'mongodb' | 'cache' | 'loading'

    // Fetch clans from serverless API (MongoDB)
    const fetchFromAPI = async () => {
        // Skip API fetch in local Vite dev to avoid noisy console errors
        // When running via 'npm run dev', /api/clans is served as a text file
        if (import.meta.env.DEV) return null;

        try {
            const response = await fetch(API_ENDPOINT);

            // Validate content type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) return null;

            if (!response.ok) return null;

            const data = await response.json();
            if (data.success && data.clans) return data.clans;
            return null;
        } catch (err) {
            return null; // Silently fail in dev
        }
    };

    // Load data on mount
    useEffect(() => {
        const loadClanData = async () => {
            setLoading(true);
            setError(null);

            // 1. Try API first (Production/Vercel)
            const apiData = await fetchFromAPI();

            if (apiData && apiData.length > 0) {
                setClans(apiData);
                setDataSource('mongodb');
                console.log(`✅ Loaded ${apiData.length} clans via MONGODB`);
            } else {
                // 2. Fallback to cached JSON file (Local/Dev)
                if (Array.isArray(cachedClanData) && cachedClanData.length > 0) {
                    setClans(cachedClanData);
                    setDataSource('cache');
                    console.log(`✅ Loaded ${cachedClanData.length} clans via LOCAL_CACHE`);
                } else {
                    setError('No clan data available');
                    setClans([]);
                }
            }

            setLoading(false);
        };

        loadClanData();
    }, []);

    // Get a specific clan by tag
    const getClanByTag = (tag) => {
        return clans.find(clan => clan.tag === tag) || null;
    };

    // Refresh clan data (re-fetches from MongoDB)
    const refreshClans = async () => {
        setLoading(true);
        const apiData = await fetchFromAPI();

        if (apiData && apiData.length > 0) {
            setClans(apiData);
            setDataSource('mongodb');
            console.log('✅ Refreshed clan data from MongoDB');
        } else {
            console.log('⚠️ Could not refresh from API, keeping existing data');
        }
        setLoading(false);
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
