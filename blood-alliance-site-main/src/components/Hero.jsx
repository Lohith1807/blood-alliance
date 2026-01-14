import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Database, Shield, Terminal, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClans } from '../context/ClanContext';
import ClanCarousel from './ClanCarousel';
import styles from '@/css/Hero.module.css';

const Hero = () => {
    const { clans, loading } = useClans();
    const [displayText, setDisplayText] = useState('');
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const fullText = 'Blood Alliance';
    const navigate = useNavigate();

    // Typing animation effect
    useEffect(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setDisplayText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
                setIsTypingComplete(true);
            }
        }, 100);

        return () => clearInterval(typingInterval);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    const handleExploreClans = () => {
        const element = document.getElementById('clans');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="home" className={styles.heroSection}>
            <div className={`container ${styles.container}`}>
                {/* LEFT Side - Content */}
                <motion.div
                    className={styles.heroContent}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Technical Tagline */}
                    <motion.div variants={itemVariants} className={styles.tagline}>
                        <Terminal size={14} style={{ color: 'var(--rh-red)' }} />
                        <span style={{ color: 'var(--rh-red)' }}>PROTOCOL_INIT:</span>
                        <span className="mono"> ALLIANCE_SQUADRON_v2.0.4</span>
                    </motion.div>

                    {/* Animated Hero Title with Typing Effect */}
                    <motion.div variants={itemVariants}>
                        <h1 className={styles.heroTitle}>
                            Clash With <br />
                            <span className={styles.typingContainer}>
                                <span style={{ color: 'var(--rh-red)' }}>
                                    {displayText}
                                </span>
                                <motion.span
                                    className={styles.cursor}
                                    animate={{ opacity: isTypingComplete ? [1, 0] : 1 }}
                                    transition={{ duration: 0.5, repeat: isTypingComplete ? Infinity : 0 }}
                                >
                                    |
                                </motion.span>
                            </span>
                        </h1>
                    </motion.div>

                    {/* Body Text */}
                    <motion.p variants={itemVariants} className={styles.description}>
                        Strategic distributed warfare unit specializing in synchronized FWA protocols
                        and CWL registration management. Unified systems, absolute victory.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={itemVariants} className={styles.btnRow}>
                        <button
                            onClick={handleExploreClans}
                            className={`btn btn-primary ${styles.btn}`}
                        >
                            EXPLORE_CLANS <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={() => navigate('/tracker')}
                            className={`btn btn-secondary ${styles.btn}`}
                        >
                            CWL_REGISTRY <Database size={14} style={{ marginLeft: '8px' }} />
                        </button>
                    </motion.div>

                    {/* System Status Mockup */}
                    <motion.div variants={itemVariants} className={styles.statusBox}>
                        <div className={styles.statusItem}>
                            <Shield size={12} />
                            <span className={styles.statusLabel}>CORE_SECURE</span>
                        </div>
                        <div className={styles.statusItem}>
                            <div className={styles.pulsingDot}></div>
                            <span className={styles.statusLabel}>
                                {loading ? 'FETCHING...' : 'UPLINK_ACTIVE'}
                            </span>
                        </div>
                        <div className={styles.statusItem}>
                            <span className={styles.statusLabel} style={{ color: 'var(--rh-red)' }}>
                                {loading ? 'LOADING...' : `${clans.length} CLANS_ONLINE`}
                            </span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* RIGHT Side - Clan Carousel */}
                <div className={styles.carouselSection}>
                    {loading ? (
                        <motion.div
                            className={styles.loadingContainer}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            <Loader2 size={48} style={{ color: 'var(--rh-red)' }} />
                        </motion.div>
                    ) : (
                        <ClanCarousel clans={clans} autoSlideInterval={4000} />
                    )}
                </div>
            </div>
        </section>
    );
};

export default Hero;
