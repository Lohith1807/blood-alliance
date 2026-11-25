import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Layers, Ticket, Users, Shield, FileText, Sliders, Terminal } from 'lucide-react';
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
            if (window.innerWidth > 992 && isMenuOpen) {
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
        setIsMenuOpen(false);
        setIsDropdownOpen(false);

        if (path === '/') {
            if (isHomePage) {
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
            } else {
                navigate('/' + hash);
            }
        } else {
            navigate(path);
        }
    };

    const handleLogout = async () => {
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
                                                    <Layers size={15} style={{ color: 'var(--rh-red)' }} />
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
                                                    <Ticket size={15} style={{ color: '#60a5fa' }} />
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
                                                    <FileText size={15} style={{ color: '#c084fc' }} />
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between', width: '100%' }}>
                                                        <span>Clan Rules Management</span>
                                                        <span style={{
                                                            fontSize: '0.62rem',
                                                            padding: '1px 4px',
                                                            background: 'rgba(168, 85, 247, 0.2)',
                                                            color: '#c084fc',
                                                            borderRadius: 2,
                                                            fontFamily: 'JetBrains Mono',
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
                                                    <Users size={15} style={{ color: '#f87171' }} />
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between', width: '100%' }}>
                                                        <span>User Management</span>
                                                        <span style={{
                                                            fontSize: '0.62rem',
                                                            padding: '1px 4px',
                                                            background: 'rgba(218, 7, 10, 0.2)',
                                                            color: 'var(--rh-red)',
                                                            borderRadius: 2,
                                                            fontFamily: 'JetBrains Mono',
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
                                                    <Sliders size={15} style={{ color: '#34d399' }} />
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between', width: '100%' }}>
                                                        <span>Module Permissions</span>
                                                        <span style={{
                                                            fontSize: '0.62rem',
                                                            padding: '1px 4px',
                                                            background: 'rgba(16, 185, 129, 0.2)',
                                                            color: '#34d399',
                                                            borderRadius: 2,
                                                            fontFamily: 'JetBrains Mono',
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
                                                    <Shield size={15} style={{ color: '#fbbf24' }} />
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'space-between', width: '100%' }}>
                                                        <span>Audit & Activity Logs</span>
                                                        <span style={{
                                                            fontSize: '0.62rem',
                                                            padding: '1px 4px',
                                                            background: 'rgba(251, 191, 36, 0.2)',
                                                            color: '#fbbf24',
                                                            borderRadius: 2,
                                                            fontFamily: 'JetBrains Mono',
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
                                                            fontFamily: 'JetBrains Mono',
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

            {/* Mobile Menu Drawer (Sidebar Menu) */}
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
                                active={location.pathname === '/player'}
                                onClick={() => handleNavClick('/player')}
                            >
                                Search
                            </MobileNavItem>

                            {/* Beside Search: LOGIN OPTION (when logged out) */}
                            {!isAuthenticated && (
                                <MobileNavItem
                                    active={location.pathname === '/login'}
                                    onClick={() => handleNavClick('/login')}
                                >
                                    Login
                                </MobileNavItem>
                            )}

                            {/* IN MOBILE SIDEBAR MENU: DISPLAY MODULES DIRECTLY */}
                            {isAuthenticated && (
                                <>
                                    <li style={{
                                        borderTop: '1px solid var(--border-color)',
                                        margin: '0.5rem 0',
                                        padding: '0.5rem 1rem 0.2rem',
                                        fontSize: '0.7rem',
                                        color: 'var(--text-muted)',
                                        fontFamily: 'JetBrains Mono',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        Alliance Modules
                                    </li>
                                    {hasModuleAccess('manage-clans') && (
                                        <MobileNavItem
                                            active={location.pathname === '/manage-clans'}
                                            onClick={() => handleNavClick('/manage-clans')}
                                        >
                                            Manage Clan List & Order
                                        </MobileNavItem>
                                    )}
                                    {hasModuleAccess('ticket-management') && (
                                        <MobileNavItem
                                            active={location.pathname === '/ticket-management'}
                                            onClick={() => handleNavClick('/ticket-management')}
                                        >
                                            Discord Ticket Management
                                        </MobileNavItem>
                                    )}
                                    {hasModuleAccess('clan-rules') && (
                                        <MobileNavItem
                                            active={location.pathname === '/clan-rules'}
                                            onClick={() => handleNavClick('/clan-rules')}
                                        >
                                            Clan Rules Management
                                        </MobileNavItem>
                                    )}
                                    {hasModuleAccess('user-management') && (
                                        <MobileNavItem
                                            active={location.pathname === '/user-management'}
                                            onClick={() => handleNavClick('/user-management')}
                                        >
                                            User Management
                                        </MobileNavItem>
                                    )}
                                    {hasModuleAccess('module-permissions') && (
                                        <MobileNavItem
                                            active={location.pathname === '/module-permissions'}
                                            onClick={() => handleNavClick('/module-permissions')}
                                        >
                                            Module Permissions (RBAC)
                                        </MobileNavItem>
                                    )}
                                    {hasModuleAccess('audit-logs') && (
                                        <MobileNavItem
                                            active={location.pathname === '/audit-logs'}
                                            onClick={() => handleNavClick('/audit-logs')}
                                        >
                                            Audit & Activity Logs
                                        </MobileNavItem>
                                    )}
                                    {hasModuleAccess('command-management') && (
                                        <MobileNavItem
                                            active={location.pathname === '/command-management'}
                                            onClick={() => handleNavClick('/command-management')}
                                        >
                                            Bot Command Management
                                        </MobileNavItem>
                                    )}

                                    {/* User status and Logout in Mobile Drawer */}
                                    <li style={{
                                        marginTop: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: 4,
                                        border: '1px solid var(--border-color)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                                {user?.name || user?.email}
                                            </div>
                                            <div style={{ fontSize: '0.68rem', color: user?.role === 'admin' ? 'var(--rh-red)' : '#60a5fa', fontFamily: 'JetBrains Mono', textTransform: 'uppercase' }}>
                                                Role: {user?.role}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="btn btn-secondary"
                                            style={{ height: 30, fontSize: '0.75rem', padding: '0 0.65rem' }}
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </>
                            )}

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
