import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Database, Shield, Terminal, Loader2 } from 'lucide-react';
import { useClans } from '../context/ClanContext';
import ClanCarousel from './ClanCarousel';

const Hero = ({ setActiveTab }) => {
    const { clans, loading } = useClans();
    const [displayText, setDisplayText] = useState('');
    const [isTypingComplete, setIsTypingComplete] = useState(false);
    const fullText = 'Blood Alliance';

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

    return (
        <section id="home" style={heroLayout}>
            <div className="container" style={containerStyle}>
                {/* LEFT Side - Content */}
                <motion.div
                    className="hero-content"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={contentBox}
                >
                    {/* Technical Tagline */}
                    <motion.div variants={itemVariants} style={tagline}>
                        <Terminal size={14} style={{ color: 'var(--rh-red)' }} />
                        <span style={{ color: 'var(--rh-red)' }}>PROTOCOL_INIT:</span>
                        <span className="mono"> ALLIANCE_SQUADRON_v2.0.4</span>
                    </motion.div>

                    {/* Animated Hero Title with Typing Effect */}
                    <motion.div variants={itemVariants}>
                        <h1 style={titleStyle}>
                            Clash With <br />
                            <span style={typingContainer}>
                                <span style={{ color: 'var(--rh-red)' }}>
                                    {displayText}
                                </span>
                                <motion.span
                                    style={cursor}
                                    animate={{ opacity: isTypingComplete ? [1, 0] : 1 }}
                                    transition={{ duration: 0.5, repeat: isTypingComplete ? Infinity : 0 }}
                                >
                                    |
                                </motion.span>
                            </span>
                        </h1>
                    </motion.div>

                    {/* Body Text */}
                    <motion.p variants={itemVariants} style={descStyle}>
                        Strategic distributed warfare unit specializing in synchronized FWA protocols
                        and CWL registration management. Unified systems, absolute victory.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={itemVariants} style={btnRow}>
                        <button
                            onClick={() => document.getElementById('clans')?.scrollIntoView({ behavior: 'smooth' })}
                            className="btn btn-primary"
                            style={mainBtn}
                        >
                            EXPLORE_CLANS <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={() => setActiveTab('players')}
                            className="btn btn-secondary"
                            style={subBtn}
                        >
                            CWL_REGISTRY <Database size={14} style={{ marginLeft: '8px' }} />
                        </button>
                    </motion.div>

                    {/* System Status Mockup */}
                    <motion.div variants={itemVariants} style={statusBox}>
                        <div style={statusItem}>
                            <Shield size={12} />
                            <span style={statusLabel}>CORE_SECURE</span>
                        </div>
                        <div style={statusItem}>
                            <div style={pulsingDot}></div>
                            <span style={statusLabel}>
                                {loading ? 'FETCHING...' : 'UPLINK_ACTIVE'}
                            </span>
                        </div>
                        <div style={statusItem}>
                            <span style={{ ...statusLabel, color: 'var(--rh-red)' }}>
                                {loading ? 'LOADING...' : `${clans.length} CLANS_ONLINE`}
                            </span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* RIGHT Side - Clan Carousel */}
                <div style={carouselSection}>
                    {loading ? (
                        <motion.div
                            style={loadingContainer}
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

const heroLayout = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    background: 'radial-gradient(circle at 30% 50%, rgba(238, 0, 0, 0.05) 0%, transparent 50%)',
    overflow: 'hidden',
};

const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '3rem',
    width: '100%',
    flexWrap: 'wrap',
};

const carouselSection = {
    flex: '1 1 400px',
    minWidth: '300px',
    maxWidth: '500px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const loadingContainer = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '280px',
};

const contentBox = {
    flex: '1 1 500px',
    maxWidth: '600px',
    padding: '2rem 0',
};

const tagline = {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '1.25rem',
    fontWeight: '600',
    letterSpacing: '0.5px',
};

const titleStyle = {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    lineHeight: '1.1',
    marginBottom: '1.5rem',
    color: '#fff',
    fontWeight: '700',
    letterSpacing: '-0.03em',
};

const typingContainer = {
    display: 'inline-block',
    minHeight: '1.2em',
};

const cursor = {
    color: 'var(--rh-red)',
    fontWeight: '100',
    marginLeft: '2px',
};

const descStyle = {
    fontSize: '0.9375rem',
    color: 'var(--text-secondary)',
    marginBottom: '2.5rem',
    maxWidth: '560px',
    lineHeight: '1.6',
};

const btnRow = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '3rem',
    flexWrap: 'wrap',
};

const mainBtn = {
    padding: '0.625rem 1.5rem',
    fontSize: '0.8125rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    gap: '8px',
};

const subBtn = {
    ...mainBtn,
};

const statusBox = {
    display: 'flex',
    gap: '1.5rem',
    paddingTop: '2rem',
    borderTop: '1px solid var(--border-color)',
    flexWrap: 'wrap',
};

const statusItem = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-muted)',
};

const statusLabel = {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.65rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
};

const pulsingDot = {
    width: '6px',
    height: '6px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    boxShadow: '0 0 8px #10b981',
    animation: 'pulse 2s infinite',
};

export default Hero;
