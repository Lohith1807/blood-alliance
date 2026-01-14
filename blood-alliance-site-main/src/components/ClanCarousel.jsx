import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ClanCarousel = ({ clans, autoSlideInterval = 4000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const totalSlides = clans.length;

    // Get index with wrapping
    const getWrappedIndex = (index) => {
        return ((index % totalSlides) + totalSlides) % totalSlides;
    };

    // Navigate to next slide
    const nextSlide = useCallback(() => {
        setCurrentIndex(prev => getWrappedIndex(prev + 1));
    }, [totalSlides]);

    // Navigate to previous slide
    const prevSlide = useCallback(() => {
        setCurrentIndex(prev => getWrappedIndex(prev - 1));
    }, [totalSlides]);

    // Go to specific slide
    const goToSlide = (index) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        // Resume auto-play after 5 seconds
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    // Auto-slide effect
    useEffect(() => {
        if (!isAutoPlaying || totalSlides <= 1) return;

        const interval = setInterval(() => {
            nextSlide();
        }, autoSlideInterval);

        return () => clearInterval(interval);
    }, [isAutoPlaying, autoSlideInterval, nextSlide, totalSlides]);

    // Calculate card properties based on position relative to current
    const getCardProps = (index) => {
        const diff = index - currentIndex;

        // Handle wrapping for smooth circular navigation
        let normalizedDiff = diff;
        if (diff > totalSlides / 2) normalizedDiff = diff - totalSlides;
        if (diff < -totalSlides / 2) normalizedDiff = diff + totalSlides;

        // Determine position and styles
        const isCenter = normalizedDiff === 0;
        const isLeft = normalizedDiff < 0;
        const isRight = normalizedDiff > 0;
        const absDistance = Math.abs(normalizedDiff);

        // Calculate transform values
        const translateX = normalizedDiff * 120; // Horizontal spacing
        const scale = isCenter ? 1.15 : Math.max(0.6, 1 - absDistance * 0.15);
        const opacity = isCenter ? 1 : Math.max(0.3, 1 - absDistance * 0.25);
        const zIndex = 10 - absDistance;
        const blur = isCenter ? 0 : absDistance * 1;

        return {
            translateX,
            scale,
            opacity,
            zIndex,
            blur,
            isCenter,
            isVisible: absDistance <= 2,
        };
    };

    if (!clans || clans.length === 0) {
        return (
            <div style={emptyState}>
                <span style={{ color: 'var(--text-muted)' }}>No clans available</span>
            </div>
        );
    }

    return (
        <div style={carouselContainer}>
            {/* Navigation Arrows */}
            <motion.button
                onClick={() => {
                    prevSlide();
                    setIsAutoPlaying(false);
                    setTimeout(() => setIsAutoPlaying(true), 5000);
                }}
                style={{ ...navButton, left: '0' }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(238, 0, 0, 0.2)' }}
                whileTap={{ scale: 0.9 }}
            >
                <ChevronLeft size={20} />
            </motion.button>

            <motion.button
                onClick={() => {
                    nextSlide();
                    setIsAutoPlaying(false);
                    setTimeout(() => setIsAutoPlaying(true), 5000);
                }}
                style={{ ...navButton, right: '0' }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(238, 0, 0, 0.2)' }}
                whileTap={{ scale: 0.9 }}
            >
                <ChevronRight size={20} />
            </motion.button>

            {/* Cards Track */}
            <div style={cardsTrack}>
                {clans.map((clan, index) => {
                    const props = getCardProps(index);

                    if (!props.isVisible) return null;

                    return (
                        <motion.div
                            key={clan.tag}
                            style={{
                                ...cardWrapper,
                                zIndex: props.zIndex,
                            }}
                            animate={{
                                x: props.translateX,
                                scale: props.scale,
                                opacity: props.opacity,
                                filter: `blur(${props.blur}px)`,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                                mass: 1,
                            }}
                            onClick={() => goToSlide(index)}
                            whileHover={!props.isCenter ? { scale: props.scale * 1.05 } : {}}
                        >
                            <div style={{
                                ...cardInner,
                                boxShadow: props.isCenter
                                    ? '0 0 40px rgba(238, 0, 0, 0.4), 0 20px 40px rgba(0, 0, 0, 0.5)'
                                    : '0 10px 30px rgba(0, 0, 0, 0.3)',
                                border: props.isCenter
                                    ? '2px solid var(--rh-red)'
                                    : '1px solid var(--border-color)',
                            }}>
                                <img
                                    src={clan.badgeUrls?.large || clan.badgeUrls?.medium}
                                    alt={clan.name}
                                    style={clanBadge}
                                />

                                {/* Clan info - only show on center card */}
                                {props.isCenter && (
                                    <motion.div
                                        style={cardInfo}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <span style={clanName}>{clan.name}</span>
                                        <span style={clanStats}>
                                            LVL {clan.clanLevel} • {clan.members}/50
                                        </span>
                                    </motion.div>
                                )}

                                {/* Glow effect for center card */}
                                {props.isCenter && <div style={glowEffect}></div>}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Dot Indicators */}
            <div style={dotsContainer}>
                {clans.map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={() => goToSlide(index)}
                        style={{
                            ...dotButton,
                            backgroundColor: index === currentIndex ? 'var(--rh-red)' : 'rgba(255, 255, 255, 0.2)',
                        }}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{
                            width: index === currentIndex ? '24px' : '8px',
                        }}
                        transition={{ duration: 0.3 }}
                    />
                ))}
            </div>

            {/* Progress bar for auto-slide */}
            {isAutoPlaying && (
                <motion.div
                    style={progressBar}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: autoSlideInterval / 1000, ease: 'linear' }}
                    key={currentIndex} // Reset animation on slide change
                />
            )}
        </div>
    );
};

// Styles
const carouselContainer = {
    position: 'relative',
    width: '100%',
    height: '280px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: '20px 0',
};

const cardsTrack = {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const cardWrapper = {
    position: 'absolute',
    cursor: 'pointer',
    transformOrigin: 'center center',
};

const cardInner = {
    position: 'relative',
    width: '140px',
    height: '160px',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    overflow: 'hidden',
    transition: 'box-shadow 0.3s ease, border 0.3s ease',
};

const clanBadge = {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    marginBottom: '0.5rem',
};

const cardInfo = {
    textAlign: 'center',
    marginTop: '0.25rem',
};

const clanName = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '120px',
};

const clanStats = {
    fontSize: '0.6rem',
    color: 'var(--text-muted)',
    fontFamily: 'JetBrains Mono, monospace',
};

const glowEffect = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '150%',
    height: '150%',
    background: 'radial-gradient(circle, rgba(238, 0, 0, 0.1) 0%, transparent 60%)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: -1,
};

const navButton = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 20,
    background: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid var(--border-color)',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    transition: 'all 0.2s ease',
};

const dotsContainer = {
    position: 'absolute',
    bottom: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
};

const dotButton = {
    height: '8px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
};

const progressBar = {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100px',
    height: '2px',
    background: 'var(--rh-red)',
    transformOrigin: 'left center',
    opacity: 0.5,
};

const emptyState = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
};

export default ClanCarousel;
