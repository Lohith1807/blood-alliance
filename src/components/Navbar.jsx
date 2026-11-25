import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Layers, Ticket, Users, Shield, FileText, Sliders, Terminal, Home, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '@/css/Navbar.module.css';

const Navbar = () => {
    const [activeSection, setActiveSection] = useState('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, isAdmin, isOwner, canViewLogs, hasModuleAccess, logout } = useAuth();

    // Check if we are on the home page
    const isHomePage = location.pathname === '/';

    // Check if any of the module routes are active
    const isModuleActive = [
        '/manage-clans',
        '/ticket-management',
        '/user-management',
        '/audit-logs',
        '/clan-rules',
        '/module-permissions',
        '/command-management'
    ].includes(location.pathname);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Prevent background scrolling while mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    // Close mobile drawer automatically if window is resized to desktop width
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768 && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMenuOpen]);

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
                    if (rect.top <= threshold && rect.bottom >= threshold) {
                        setActiveSection(section);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHomePage]);

    // Handle hash scrolling when location/hash changes
    useEffect(() => {
        if (location.hash && isHomePage) {
            const id = location.hash.replace('#', '');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    const yOffset = -56;
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        } else if (isHomePage && !location.hash) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location, isHomePage]);

    const handleNavClick = (path, hash = '') => {
        document.body.style.overflow = '';
        setIsMenuOpen(false);
        setIsDropdownOpen(false);

        if (path === '/') {
            if (isHomePage) {
                requestAnimationFrame(() => {
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
                });
            } else {
                navigate('/' + hash);
            }
        } else {
            navigate(path);
        }
    };

    const handleLogout = async () => {
        document.body.style.overflow = '';
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
        await logout();
        navigate('/', { replace: true });
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
                                active={location.pathname === '/player'}
                                onClick={() => handleNavClick('/player')}
                            >
                                Search
                            </NavItem>
                        </li>

                        {/* AFTER LOGIN: ONLY A DROPDOWN ON DESKTOP */}
                        {isAuthenticated && (
                            <li className={styles.dropdownWrapper} ref={dropdownRef}>
                                <span
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={styles.link}
                                    style={{
                                        color: isModuleActive ? '#ffffff' : 'var(--muted-foreground)',
                                        backgroundColor: isModuleActive ? 'var(--primary)' : 'transparent',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem'
                                    }}
                                >
                                    <span>Modules</span>
                                    <ChevronDown
                                        size={14}
                                        className={`${styles.dropdownChevron} ${isDropdownOpen ? styles.dropdownChevronOpen : ''}`}
                                    />
                                </span>

                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.15 }}
                                            className={styles.dropdownMenu}
                                        >
                                            <div className={styles.dropdownHeader}>
                                                Alliance Modules
                                            </div>
                                            {hasModuleAccess('manage-clans') && (
                                                <div
                                                    className={`${styles.dropdownItem} ${location.pathname === '/manage-clans' ? styles.dropdownItemActive : ''}`}
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        handleNavClick('/manage-clans');
                                                    }}
                                                >
                                                    <img src="/images/clan-castle.png" alt="Clans" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />
                                                    <span>Manage Clan List & Order</span>
                                                </div>
                                            )}

                                            {hasModuleAccess('ticket-management') && (
                                                <div
                                                    className={`${styles.dropdownItem} ${location.pathname === '/ticket-management' ? styles.dropdownItemActive : ''}`}
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        handleNavClick('/ticket-management');
                                                    }}
                                                >
                                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="#5865f2" aria-hidden="true" style={{ flexShrink: 0 }}>
                                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                                    </svg>
                                                    <span>Discord Ticket Management</span>
                                                </div>
                                            )}

                                            {hasModuleAccess('clan-rules') && (
                                                <div
                                                    className={`${styles.dropdownItem} ${location.pathname === '/clan-rules' ? styles.dropdownItemActive : ''}`}
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        handleNavClick('/clan-rules');
                                                    }}
                                                >
                                                    <img src="/images/clan-rules.png" alt="Clan Rules" style={{ width: 20, height: 20, transform: 'scale(1.45)', objectFit: 'contain', flexShrink: 0 }} />
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between', width: '100%' }}>
                                                        <span>Clan Rules Management</span>
                                                        <span style={{
                                                            fontSize: '0.62rem',
                                                            padding: '1px 5px',
                                                            background: 'rgba(168, 85, 247, 0.2)',
                                                            color: '#c084fc',
                                                            borderRadius: 6,
                                                            fontFamily: 'var(--font-sans)',
                                                            fontWeight: 700
                                                        }}>
                                                            LEADER
                                                        </span>
                                                    </span>
                                                </div>
                                            )}

                                            {hasModuleAccess('user-management') && (
                                                <div
                                                    className={`${styles.dropdownItem} ${location.pathname === '/user-management' ? styles.dropdownItemActive : ''}`}
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        handleNavClick('/user-management');
                                                    }}
                                                >
                                                    <img src="/images/members.png" alt="Users" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between', width: '100%' }}>
                                                        <span>User Management</span>
                                                        <span style={{
                                                            fontSize: '0.62rem',
                                                            padding: '1px 5px',
                                                            background: 'rgba(218, 7, 10, 0.2)',
                                                            color: 'var(--rh-red)',
                                                            borderRadius: 6,
                                                            fontFamily: 'var(--font-sans)',
                                                            fontWeight: 700
                                                        }}>
                                                            ADMIN
                                                        </span>
                                                    </span>
                                                </div>
                                            )}

                                            {hasModuleAccess('module-permissions') && (
                                                <div
                                                    className={`${styles.dropdownItem} ${location.pathname === '/module-permissions' ? styles.dropdownItemActive : ''}`}
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        handleNavClick('/module-permissions');
                                                    }}
                                                >
                                                    <img src="/images/module-perms.png" alt="Permissions" style={{ width: 20, height: 20, transform: 'scale(1.45)', objectFit: 'contain', flexShrink: 0 }} />
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between', width: '100%' }}>
                                                        <span>Module Permissions</span>
                                                        <span style={{
                                                            fontSize: '0.62rem',
                                                            padding: '1px 5px',
                                                            background: 'rgba(16, 185, 129, 0.2)',
                                                            color: '#34d399',
                                                            borderRadius: 6,
                                                            fontFamily: 'var(--font-sans)',
                                                            fontWeight: 700
                                                        }}>
                                                            RBAC
                                                        </span>
                                                    </span>
                                                </div>
                                            )}

                                            {hasModuleAccess('audit-logs') && (
                                                <div
                                                    className={`${styles.dropdownItem} ${location.pathname === '/audit-logs' ? styles.dropdownItemActive : ''}`}
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        handleNavClick('/audit-logs');
                                                    }}
                                                >
                                                    <img src="/images/audit-logs.png" alt="Logs" style={{ width: 20, height: 20, transform: 'scale(1.45)', objectFit: 'contain', flexShrink: 0 }} />
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between', width: '100%' }}>
                                                        <span>Audit & Activity Logs</span>
                                                        <span style={{
                                                            fontSize: '0.62rem',
                                                            padding: '1px 5px',
                                                            background: 'rgba(251, 191, 36, 0.2)',
                                                            color: '#fbbf24',
                                                            borderRadius: 6,
                                                            fontFamily: 'var(--font-sans)',
                                                            fontWeight: 700
                                                        }}>
                                                            {isOwner ? 'OWNER' : 'LOGS'}
                                                        </span>
                                                    </span>
                                                </div>
                                            )}

                                            {hasModuleAccess('command-management') && (
                                                <div
                                                    className={`${styles.dropdownItem} ${location.pathname === '/command-management' ? styles.dropdownItemActive : ''}`}
                                                    onClick={() => {
                                                        setIsDropdownOpen(false);
                                                        handleNavClick('/command-management');
                                                    }}
                                                >
                                                    <Terminal size={15} style={{ color: '#ec4899' }} />
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between', width: '100%' }}>
                                                        <span>Bot Command Management</span>
                                                        <span style={{
                                                            fontSize: '0.62rem',
                                                            padding: '1px 4px',
                                                            background: 'rgba(236, 72, 153, 0.2)',
                                                            color: '#f472b6',
                                                            borderRadius: 2,
                                                            fontFamily: 'var(--font-sans)',
                                                            fontWeight: 700
                                                        }}>
                                                            BOT
                                                        </span>
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </li>
                        )}
                    </ul>
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {/* Logged in status & Logout on Desktop */}
                    {isAuthenticated && (
                        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '2px',
                                    padding: '0.24rem 0.7rem',
                                    background: 'var(--muted)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '9999px',
                                    fontFamily: 'var(--font-sans)',
                                    lineHeight: 1.1
                                }}
                                title={user?.email}
                            >
                                {user?.name && (
                                    <span style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        color: 'var(--text-primary)'
                                    }}>
                                        {user.name}
                                    </span>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.32rem' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        backgroundColor: '#4ade80',
                                        flexShrink: 0
                                    }} />
                                    <span style={{
                                        fontSize: user?.name ? '0.58rem' : '0.68rem',
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-mono)',
                                        letterSpacing: '0.04em',
                                        color: user?.role === 'admin' ? 'var(--rh-red)' : '#60a5fa'
                                    }}>
                                        {user?.role?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary"
                                style={{
                                    height: 28,
                                    padding: '0 0.65rem',
                                    fontSize: '0.75rem',
                                    borderRadius: 'var(--radius-md)'
                                }}
                                title="Sign out of your session"
                            >
                                Logout
                            </button>
                        </div>
                    )}

                    {!isAuthenticated && (
                        <button
                            onClick={() => handleNavClick('/login')}
                            className="btn btn-secondary hide-mobile"
                            style={{
                                height: 28,
                                padding: '0 0.7rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--card)',
                                borderColor: 'var(--border-color)',
                                color: '#ffffff'
                            }}
                        >
                            Login
                        </button>
                    )}

                    <a
                        href="https://discord.gg/gGGEs5SV9z"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn btn-primary hide-mobile ${styles.discordBtn}`}
                        style={{ gap: '0.4rem' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                        Join Discord
                    </a>

                    {/* Hamburger Button for Mobile */}
                    <button
                        className={`show-mobile ${styles.hamburger}`}
                        onClick={toggleMenu}
                        aria-label="Toggle Navigation Menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Sheet Menu */}
            <AnimatePresence>
                {isMenuOpen && [
                    <motion.div
                        key="mobile-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={styles.mobileBackdrop}
                        onClick={() => setIsMenuOpen(false)}
                    />,
                    <motion.div
                        key="mobile-sheet"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        className={styles.mobileBottomSheet}
                    >
                            <div className={styles.mobileHandle} />

                            {/* Top: User Name + Role (if logged in) or Login button */}
                            {isAuthenticated ? (
                                <div className={styles.mobileUserCard}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {user?.name || user?.email}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4ade80' }} />
                                            <span style={{ fontSize: '0.68rem', color: user?.role === 'admin' ? 'var(--rh-red)' : '#60a5fa', fontFamily: 'var(--font-sans)', fontWeight: 700, textTransform: 'uppercase' }}>
                                                {user?.role}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="btn btn-secondary"
                                        style={{ height: 32, fontSize: '0.75rem', padding: '0 0.75rem', borderRadius: 'var(--radius-lg)', flexShrink: 0 }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleNavClick('/login')}
                                    className={styles.mobileGridBtn}
                                    style={{ width: '100%', padding: '0.72rem', marginBottom: '0.25rem' }}
                                >
                                    Login
                                </button>
                            )}

                            <div className={styles.mobileSectionLabel}>Explore</div>
                            <div className={styles.mobileGrid2}>
                                <button
                                    type="button"
                                    className={`${styles.mobileGridBtn} ${isHomePage && activeSection === 'home' ? styles.mobileGridBtnActive : ''}`}
                                    onClick={() => handleNavClick('/', '#home')}
                                >
                                    <Home size={20} />
                                    <span>Home</span>
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.mobileGridBtn} ${isHomePage && activeSection === 'clans' ? styles.mobileGridBtnActive : ''}`}
                                    onClick={() => handleNavClick('/', '#clans')}
                                >
                                    <img src="/images/clan-castle.png" alt="Clans" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                                    <span>Clans</span>
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.mobileGridBtn} ${isHomePage && activeSection === 'cwl-rules' ? styles.mobileGridBtnActive : ''}`}
                                    onClick={() => handleNavClick('/', '#cwl-rules')}
                                >
                                    <img src="/images/cwl-medal.png" alt="CWL Rules" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                                    <span>CWL Rules</span>
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.mobileGridBtn} ${isHomePage && activeSection === 'rules' ? styles.mobileGridBtnActive : ''}`}
                                    onClick={() => handleNavClick('/', '#rules')}
                                >
                                    <img src="/images/clan-rules.png" alt="Rules" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
                                    <span>Rules</span>
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.mobileGridBtn} ${location.pathname === '/player' ? styles.mobileGridBtnActive : ''}`}
                                    style={{ gridColumn: '1 / -1' }}
                                    onClick={() => handleNavClick('/player')}
                                >
                                    <Search size={20} />
                                    <span>Search Player</span>
                                </button>
                            </div>

                            {/* Modules in 2-column grid when logged in */}
                            {isAuthenticated && (
                                <>
                                    <div className={styles.mobileSectionLabel}>Modules</div>
                                    <div className={styles.mobileGrid2}>
                                        {hasModuleAccess('manage-clans') && (
                                            <button
                                                type="button"
                                                className={`${styles.mobileGridBtn} ${location.pathname === '/manage-clans' ? styles.mobileGridBtnActive : ''}`}
                                                onClick={() => handleNavClick('/manage-clans')}
                                            >
                                                <img src="/images/clan-castle.png" alt="Clans" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                                                <span>Manage Clans</span>
                                            </button>
                                        )}
                                        {hasModuleAccess('ticket-management') && (
                                            <button
                                                type="button"
                                                className={`${styles.mobileGridBtn} ${location.pathname === '/ticket-management' ? styles.mobileGridBtnActive : ''}`}
                                                onClick={() => handleNavClick('/ticket-management')}
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="#5865f2" aria-hidden="true" style={{ flexShrink: 0 }}>
                                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                                </svg>
                                                <span>Tickets</span>
                                            </button>
                                        )}
                                        {hasModuleAccess('clan-rules') && (
                                            <button
                                                type="button"
                                                className={`${styles.mobileGridBtn} ${location.pathname === '/clan-rules' ? styles.mobileGridBtnActive : ''}`}
                                                onClick={() => handleNavClick('/clan-rules')}
                                            >
                                                <img src="/images/clan-rules.png" alt="Clan Rules" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
                                                <span>Clan Rules</span>
                                            </button>
                                        )}
                                        {hasModuleAccess('user-management') && (
                                            <button
                                                type="button"
                                                className={`${styles.mobileGridBtn} ${location.pathname === '/user-management' ? styles.mobileGridBtnActive : ''}`}
                                                onClick={() => handleNavClick('/user-management')}
                                            >
                                                <img src="/images/members.png" alt="Users" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                                                <span>Users</span>
                                            </button>
                                        )}
                                        {hasModuleAccess('module-permissions') && (
                                            <button
                                                type="button"
                                                className={`${styles.mobileGridBtn} ${location.pathname === '/module-permissions' ? styles.mobileGridBtnActive : ''}`}
                                                onClick={() => handleNavClick('/module-permissions')}
                                            >
                                                <img src="/images/module-perms.png" alt="Permissions" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
                                                <span>Permissions</span>
                                            </button>
                                        )}
                                        {hasModuleAccess('audit-logs') && (
                                            <button
                                                type="button"
                                                className={`${styles.mobileGridBtn} ${location.pathname === '/audit-logs' ? styles.mobileGridBtnActive : ''}`}
                                                onClick={() => handleNavClick('/audit-logs')}
                                            >
                                                <img src="/images/audit-logs.png" alt="Audit Logs" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
                                                <span>Audit Logs</span>
                                            </button>
                                        )}
                                        {hasModuleAccess('command-management') && (
                                            <button
                                                type="button"
                                                className={`${styles.mobileGridBtn} ${location.pathname === '/command-management' ? styles.mobileGridBtnActive : ''}`}
                                                style={{ gridColumn: '1 / -1' }}
                                                onClick={() => handleNavClick('/command-management')}
                                            >
                                                <Terminal size={20} style={{ color: '#ec4899' }} />
                                                <span>Bot Commands</span>
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                ]}
            </AnimatePresence>
        </header>
    );
};

const NavItem = ({ children, active, onClick }) => (
    <span
        onClick={onClick}
        className={styles.link}
        style={{
            color: active ? '#ffffff' : 'var(--muted-foreground)',
            backgroundColor: active ? 'var(--primary)' : 'transparent',
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
            color: active ? '#ffffff' : 'var(--muted-foreground)',
            backgroundColor: active ? 'var(--primary)' : 'transparent',
            borderRadius: 'var(--radius-xl)'
        }}
    >
        {children}
    </li>
);

export default Navbar;
