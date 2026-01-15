import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Database } from 'lucide-react';
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

    // Reconstruct the full tag (add # back)
    const clanTag = tag ? `#${tag}` : null;

    // Find the clan from context
    const clan = useMemo(() => {
        if (!clanTag) return null;
        return getClanByTag(clanTag);
    }, [clanTag, clans, getClanByTag]);

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
                    <h2 style={{ color: '#fff', marginBottom: '0.5rem', marginTop: '1rem' }}>FETCHING_DATA</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Loading clan data from Blood Alliance Database...
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
                    <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>CLAN_NOT_FOUND</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Unable to retrieve data for clan tag: {clanTag}
                    </p>
                    <button onClick={handleBack} className={`btn btn-primary ${styles.backButton}`}>
                        <ArrowLeft size={16} /> RETURN_TO_HOME
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="container" style={{ padding: '6rem 0', minHeight: 'calc(100vh - 56px)' }}>
            {/* Back Button */}
            <motion.button
                onClick={handleBack}
                className={styles.backNav}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: -5 }}
            >
                <ArrowLeft size={16} />
                <span>RETURN_TO_HOME</span>
            </motion.button>

            <ClanHeader clan={clan} />
            <ClanStats clan={clan} />
            <ClanMembersTable memberList={clan.memberList} />
        </section>
    );
};

export default ClanDetail;
