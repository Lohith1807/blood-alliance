import React, { createContext, useContext, useState, useEffect } from 'react';
import CONFIG from '@/config';

// Create the Clan Context
const ClanContext = createContext();

// Clan Context Provider
export const ClanProvider = ({ children }) => {
    const [clans, setClans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClan, setSelectedClan] = useState(null);
    const [dataSource, setDataSource] = useState('loading'); // 'mongodb' | 'loading'

    // Fetch clans from serverless API (MongoDB)
    const fetchFromAPI = async () => {
        try {
            const response = await fetch(CONFIG.api.endpoints.clans);

            // Validate content type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) return null;

            if (!response.ok) return null;

            const data = await response.json();
            if (data.success && data.clans) return data.clans;
            return null;
        } catch (err) {
            console.error('API Fetch Error:', err);
            return null;
        }
    };

    // Load data on mount
    useEffect(() => {
        const loadClanData = async () => {
            setLoading(true);
            setError(null);

            // Always try API (DB source)
            const apiData = await fetchFromAPI();

            if (apiData && apiData.length > 0) {
                setClans(apiData);
                setDataSource('mongodb');
                console.log(`✅ Loaded ${apiData.length} clans via MONGODB`);
            } else {
                setError('Failed to load clan data from database');
                setClans([]);
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
