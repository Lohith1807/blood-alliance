import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Database, RefreshCw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClans } from '../context/ClanContext';
import styles from '@/css/ClanDetail.module.css';

// Sub-components
import ClanHeader from './ClanDetailComponents/ClanHeader';
import ClanStats from './ClanDetailComponents/ClanStats';
import ClanMembersTable from './ClanDetailComponents/ClanMembersTable';

const ClanDetail = () => {
    const { tag } = useParams();
    const navigate = useNavigate();
    const { clans, loading, getClanByTag } = useClans();
    const [liveClan, setLiveClan] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Reconstruct the full tag (add # back)
    const clanTag = tag ? `#${tag.toUpperCase()}` : null;

    // Base clan from context (instant render)
    const contextClan = useMemo(() => {
        if (!clanTag) return null;
        return getClanByTag(clanTag);
    }, [clanTag, clans, getClanByTag]);

    const fetchLive = useCallback(async (forceRefresh = false) => {
        if (!clanTag) return;
        if (forceRefresh) setRefreshing(true);
        try {
            const url = `/api/coc-proxy?path=${encodeURIComponent(`/api/clan/${clanTag}`)}${forceRefresh ? '&refresh=true' : ''}`;
            const res = await fetch(url);
            if (!res.ok) return;
            const data = await res.json();
            if (data && data.tag) {
                setLiveClan(data);
            }
        } catch {
            // Keep contextClan fallback silently
        } finally {
            if (forceRefresh) setRefreshing(false);
        }
    }, [clanTag]);

    // Fetch real-time clan data from CoC backend via coc-proxy (2-min cached)
    useEffect(() => {
        setLiveClan(null);
        fetchLive(false);
    }, [fetchLive]);

    const clan = useMemo(() => {
        if (!contextClan && !liveClan) return null;
        return {
            ...(contextClan || {}),
            ...(liveClan || {}),
            clanType: contextClan?.clanType || liveClan?.clanType || 'FWA',
            order: contextClan?.order,
        };
    }, [contextClan, liveClan]);

    const handleBack = () => {
        navigate('/');
    };

    // Loading state
    if (loading) {
        return (
            <section className="container" style={{ padding: '6rem 0', minHeight: 'calc(100vh - 56px)' }}>
                <div className={styles.errorState}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Loader2 size={48} style={{ color: 'var(--rh-red)' }} />
                    </motion.div>
                    <h2 style={{ color: '#fff', marginBottom: '0.5rem', marginTop: '1rem' }}>Loading data...</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Fetching clan data from the database...
                    </p>
                </div>
            </section>
        );
    }

    if (!clan) {
        return (
            <section className="container" style={{ padding: '6rem 0', minHeight: 'calc(100vh - 56px)' }}>
                <div className={styles.errorState}>
                    <Database size={48} style={{ color: 'var(--rh-red)', marginBottom: '1rem' }} />
                    <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Clan not found</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Unable to find data for clan tag: {clanTag}
                    </p>
                    <button onClick={handleBack} className={`btn btn-primary ${styles.backButton}`}>
                        <ArrowLeft size={16} /> Back to Home
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="container" style={{ padding: '6rem 0', minHeight: 'calc(100vh - 56px)' }}>
            {/* Top Navigation Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <motion.button
                    onClick={handleBack}
                    className={styles.backNav}
                    style={{ marginBottom: 0 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: -5 }}
                >
                    <ArrowLeft size={16} />
                    <span>Back to Home</span>
                </motion.button>

                <button
                    onClick={() => fetchLive(true)}
                    disabled={refreshing}
                    className="btn btn-secondary"
                    style={{ height: 34, padding: '0 0.85rem', fontSize: '0.78rem', gap: '0.4rem' }}
                    title="Fetch latest data from CoC API"
                >
                    <RefreshCw size={14} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}} />
                    <span>{refreshing ? 'Refreshing...' : 'Refresh Live'}</span>
                </button>
            </div>

            <ClanHeader clan={clan} />
            <ClanStats clan={clan} />
            <ClanMembersTable memberList={clan.memberList} />
        </section>
    );
};

export default ClanDetail;
