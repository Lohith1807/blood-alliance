import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '@/css/ClanCarousel.module.css';

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
            <div className={styles.emptyState}>
                <span style={{ color: 'var(--text-muted)' }}>No clans available</span>
            </div>
        );
    }

    return (
        <div className={styles.carouselContainer}>
            {/* Navigation Arrows */}
            <motion.button
                onClick={() => {
                    prevSlide();
                    setIsAutoPlaying(false);
                    setTimeout(() => setIsAutoPlaying(true), 5000);
                }}
                className={`${styles.navButton} ${styles.navButtonLeft}`}
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
                className={`${styles.navButton} ${styles.navButtonRight}`}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(238, 0, 0, 0.2)' }}
                whileTap={{ scale: 0.9 }}
            >
                <ChevronRight size={20} />
            </motion.button>

            {/* Cards Track */}
            <div className={styles.cardsTrack}>
                {clans.map((clan, index) => {
                    const props = getCardProps(index);

                    if (!props.isVisible) return null;

                    return (
                        <motion.div
                            key={clan.tag}
                            className={styles.cardWrapper}
                            style={{
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
                            <div
                                className={styles.cardInner}
                                style={{
                                    boxShadow: props.isCenter
                                        ? '0 0 40px rgba(238, 0, 0, 0.4), 0 20px 40px rgba(0, 0, 0, 0.5)'
                                        : '0 10px 30px rgba(0, 0, 0, 0.3)',
                                    border: props.isCenter
                                        ? '2px solid var(--rh-red)'
                                        : '1px solid var(--border-color)',
                                }}>
                                <img
                                    src={clan.badgeUrls?.large || clan.badgeUrls?.medium || 'https://api-assets.clashofclans.com/badges/200/empty.png'}
                                    alt={clan.name}
                                    className={styles.clanBadge}
                                    onError={(e) => { e.target.src = 'https://api-assets.clashofclans.com/badges/200/empty.png'; }}
                                />

                                {/* Clan info - only show on center card */}
                                {props.isCenter && (
                                    <motion.div
                                        className={styles.cardInfo}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <span className={styles.clanName}>{clan.name}</span>
                                        <span className={styles.clanStats}>
                                            LVL {clan.clanLevel} • {clan.members}/50
                                        </span>
                                    </motion.div>
                                )}

                                {/* Glow effect for center card */}
                                {props.isCenter && <div className={styles.glowEffect}></div>}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Dot Indicators */}
            <div className={styles.dotsContainer}>
                {clans.map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={styles.dotButton}
                        style={{
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
                    className={styles.progressBar}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: autoSlideInterval / 1000, ease: 'linear' }}
                    key={currentIndex} // Reset animation on slide change
                />
            )}
        </div>
    );
};

export default ClanCarousel;
