import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styles from '@/css/Navbar.module.css';

const Navbar = () => {
    const [activeSection, setActiveSection] = useState('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Check if we are on the home page
    const isHomePage = location.pathname === '/';

    // Handle scroll to update active section highlighting
    useEffect(() => {
        if (!isHomePage) {
            setActiveSection('');
            return;
        }

        const handleScroll = () => {
            const sections = ['home', 'clans', 'cwl-rules', 'rules'];
            const threshold = 120; // Visibility threshold

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // If the top of the section is within range, set it as active
                    if (rect.top <= threshold && rect.bottom >= threshold) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHomePage]);

    // Handle hash scrolling when location/hash changes
    useEffect(() => {
        if (location.hash && isHomePage) {
            const id = location.hash.replace('#', '');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    const yOffset = -56; // Navbar height
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        } else if (isHomePage && !location.hash) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location, isHomePage]);

    const handleNavClick = (path, hash = '') => {
        setIsMenuOpen(false); // Close mobile menu on click

        if (path === '/') {
            if (isHomePage) {
                // If already on home, just scroll
                if (hash) {
                    const id = hash.replace('#', '');
                    const element = document.getElementById(id);
                    if (element) {
                        const yOffset = -56;
                        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                // Update URL without reload if desired, or just let scroll handle it
                // navigate(hash ? '/' + hash : '/'); // Optional
            } else {
                // Navigate to home (with hash)
                navigate('/' + hash);
            }
        } else {
            navigate(path);
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className={styles.header}>
            <div className={`container ${styles.container}`}>
                <motion.div
                    className={styles.logoContainer}
                    onClick={() => handleNavClick('/')}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    whileHover={{ scale: 1.05 }}
                >
                    <div className={styles.logoMark}>
                        <span className={styles.bChar}>B</span>
                        <span className={styles.aChar}>A</span>
                    </div>
                    <div className={styles.logoText}>
                        <span className={styles.logoTextBlood}>BLOOD</span>
                        <span className={styles.logoTextAlliance}>ALLIANCE</span>
                    </div>
                </motion.div>

                {/* Desktop Tabs */}
                <nav className={`hide-mobile ${styles.nav}`}>
                    <ul className={styles.ul}>
                        <li>
                            <NavItem
                                active={isHomePage && activeSection === 'home'}
                                onClick={() => handleNavClick('/', '#home')}
                            >
                                Home
                            </NavItem>
                        </li>
                        <li>
                            <NavItem
                                active={isHomePage && activeSection === 'clans'}
                                onClick={() => handleNavClick('/', '#clans')}
                            >
                                Clans
                            </NavItem>
                        </li>
                        <li>
                            <NavItem
                                active={isHomePage && activeSection === 'cwl-rules'}
                                onClick={() => handleNavClick('/', '#cwl-rules')}
                            >
                                CWL Rules
                            </NavItem>
                        </li>
                        <li>
                            <NavItem
                                active={isHomePage && activeSection === 'rules'}
                                onClick={() => handleNavClick('/', '#rules')}
                            >
                                Rules
                            </NavItem>
                        </li>
                        <li>
                            <NavItem
                                active={false}
                                onClick={() => window.location.href = 'https://bloodalliance-flax.vercel.app/'}
                            >
                                Register for CWL
                            </NavItem>
                        </li>
                        <li>
                            <NavItem
                                active={location.pathname === '/tracker'}
                                onClick={() => handleNavClick('/tracker')}
                            >
                                CWL Players
                            </NavItem>
                        </li>
                        <li>
                            <NavItem
                                active={location.pathname === '/player'}
                                onClick={() => handleNavClick('/player')}
                            >
                                Search
                            </NavItem>
                        </li>
                    </ul>
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a
                        href="https://discord.gg/gGGEs5SV9z"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn btn-primary hide-mobile ${styles.discordBtn}`}
                    >
                        Join Discord
                    </a>

                    {/* Hamburger Button */}
                    <button
                        className={`show-mobile ${styles.hamburger}`}
                        onClick={toggleMenu}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className={styles.mobileMenuOverlay}
                    >
                        <ul className={styles.mobileUl}>
                            <MobileNavItem
                                active={isHomePage && activeSection === 'home'}
                                onClick={() => handleNavClick('/', '#home')}
                            >
                                Home
                            </MobileNavItem>
                            <MobileNavItem
                                active={isHomePage && activeSection === 'clans'}
                                onClick={() => handleNavClick('/', '#clans')}
                            >
                                Clans
                            </MobileNavItem>
                            <MobileNavItem
                                active={isHomePage && activeSection === 'cwl-rules'}
                                onClick={() => handleNavClick('/', '#cwl-rules')}
                            >
                                CWL Rules
                            </MobileNavItem>
                            <MobileNavItem
                                active={isHomePage && activeSection === 'rules'}
                                onClick={() => handleNavClick('/', '#rules')}
                            >
                                Rules
                            </MobileNavItem>
                            <MobileNavItem
                                active={false}
                                onClick={() => window.location.href = 'https://bloodalliance-flax.vercel.app/'}
                            >
                                Register for CWL
                            </MobileNavItem>
                            <MobileNavItem
                                active={location.pathname === '/tracker'}
                                onClick={() => handleNavClick('/tracker')}
                            >
                                CWL Players
                            </MobileNavItem>
                            <MobileNavItem
                                active={location.pathname === '/player'}
                                onClick={() => handleNavClick('/player')}
                            >
                                Search
                            </MobileNavItem>
                            <li style={{ marginTop: '1rem' }}>
                                <a
                                    href="https://discord.gg/gGGEs5SV9z"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary"
                                    style={{ width: '100%', height: '40px' }}
                                >
                                    Join Discord
                                </a>
                            </li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

const NavItem = ({ children, active, onClick }) => (
    <span
        onClick={onClick}
        className={styles.link}
        style={{
            color: active ? 'var(--rh-red)' : 'var(--text-secondary)',
            borderBottom: active ? '2px solid var(--rh-red)' : '2px solid transparent',
            cursor: 'pointer'
        }}
    >
        {children}
    </span>
);

const MobileNavItem = ({ children, active, onClick }) => (
    <li
        onClick={onClick}
        className={styles.mobileLink}
        style={{
            color: active ? 'var(--rh-red)' : 'var(--text-primary)',
            backgroundColor: active ? 'rgba(238, 0, 0, 0.1)' : 'transparent',
            borderLeft: active ? '3px solid var(--rh-red)' : '3px solid transparent'
        }}
    >
        {children}
    </li>
);

export default Navbar;
