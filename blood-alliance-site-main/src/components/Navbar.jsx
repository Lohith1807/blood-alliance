import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
    const [activeSection, setActiveSection] = useState('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Handle scroll to update active section highlighting
    useEffect(() => {
        if (activeTab !== 'home') return;

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
    }, [activeTab]);

    const handleNavClick = (tab, sectionId = null) => {
        setActiveTab(tab);
        setIsMenuOpen(false); // Close mobile menu on click

        if (sectionId) {
            setActiveSection(sectionId);
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    const yOffset = -56; // Navbar height
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: sectionId === 'home' ? 0 : y, behavior: 'smooth' });
                }
            }, 100);
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header style={headerStyle}>
            <div className="container" style={containerStyle}>
                <motion.div
                    style={logoContainer}
                    onClick={() => handleNavClick('home', 'home')}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    whileHover={{ scale: 1.05 }}
                >
                    <div style={logoMark}>
                        <span style={bChar}>B</span>
                        <span style={aChar}>A</span>
                    </div>
                    <div style={logoText}>
                        <span style={{ color: 'var(--rh-red)', fontWeight: '800' }}>BLOOD</span>
                        <span style={{ color: '#fff', fontWeight: '400', marginLeft: '5px' }}>ALLIANCE</span>
                    </div>
                </motion.div>

                {/* Desktop Tabs */}
                <nav className="hide-mobile" style={navStyle}>
                    <ul style={ulStyle}>
                        <li>
                            <NavItem
                                active={activeTab === 'home' && activeSection === 'home'}
                                onClick={() => handleNavClick('home', 'home')}
                            >
                                Home
                            </NavItem>
                        </li>
                        <li>
                            <NavItem
                                active={activeTab === 'home' && activeSection === 'clans'}
                                onClick={() => handleNavClick('home', 'clans')}
                            >
                                Clans
                            </NavItem>
                        </li>
                        <li>
                            <NavItem
                                active={activeTab === 'home' && activeSection === 'cwl-rules'}
                                onClick={() => handleNavClick('home', 'cwl-rules')}
                            >
                                CWL Rules
                            </NavItem>
                        </li>
                        <li>
                            <NavItem
                                active={activeTab === 'home' && activeSection === 'rules'}
                                onClick={() => handleNavClick('home', 'rules')}
                            >
                                Rules
                            </NavItem>
                        </li>
                        <li>
                            <NavItem
                                active={activeTab === 'players'}
                                onClick={() => {
                                    setActiveTab('players');
                                    setActiveSection('');
                                }}
                            >
                                CWL Players
                            </NavItem>
                        </li>
                    </ul>
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a
                        href="https://discord.gg/gGGEs5SV9z"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary hide-mobile"
                        style={{ height: '32px', padding: '0 0.75rem', fontSize: '0.8rem', borderRadius: '2px' }}
                    >
                        Join Discord
                    </a>

                    {/* Hamburger Button */}
                    <button
                        className="show-mobile"
                        onClick={toggleMenu}
                        style={hamburgerStyle}
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
                        style={mobileMenuOverlay}
                    >
                        <ul style={mobileUlStyle}>
                            <MobileNavItem
                                active={activeTab === 'home' && activeSection === 'home'}
                                onClick={() => handleNavClick('home', 'home')}
                            >
                                Home
                            </MobileNavItem>
                            <MobileNavItem
                                active={activeTab === 'home' && activeSection === 'clans'}
                                onClick={() => handleNavClick('home', 'clans')}
                            >
                                Clans
                            </MobileNavItem>
                            <MobileNavItem
                                active={activeTab === 'home' && activeSection === 'cwl-rules'}
                                onClick={() => handleNavClick('home', 'cwl-rules')}
                            >
                                CWL Rules
                            </MobileNavItem>
                            <MobileNavItem
                                active={activeTab === 'home' && activeSection === 'rules'}
                                onClick={() => handleNavClick('home', 'rules')}
                            >
                                Rules
                            </MobileNavItem>
                            <MobileNavItem
                                active={activeTab === 'players'}
                                onClick={() => {
                                    setActiveTab('players');
                                    setActiveSection('');
                                    setIsMenuOpen(false);
                                }}
                            >
                                CWL Players
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
        style={{
            ...linkStyle,
            color: active ? 'var(--rh-red)' : 'var(--text-secondary)',
            borderBottom: active ? '2px solid var(--rh-red)' : '2px solid transparent'
        }}
    >
        {children}
    </span>
);

const MobileNavItem = ({ children, active, onClick }) => (
    <li
        onClick={onClick}
        style={{
            ...mobileLinkStyle,
            color: active ? 'var(--rh-red)' : 'var(--text-primary)',
            backgroundColor: active ? 'rgba(238, 0, 0, 0.1)' : 'transparent',
            borderLeft: active ? '3px solid var(--rh-red)' : '3px solid transparent'
        }}
    >
        {children}
    </li>
);

const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: 'var(--nav-height)',
    background: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
};

const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
};

const logoContainer = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
};

const logoMark = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(238, 0, 0, 0.14)',
    border: '1px solid rgba(238, 0, 0, 0.4)',
    borderRadius: '4px',
    padding: '3px 7px',
    fontSize: '1.05rem',
    fontWeight: '900',
    letterSpacing: '-1px',
    lineHeight: '1',
};

const bChar = {
    color: 'var(--rh-red)',
    textShadow: '0 0 10px rgba(238, 0, 0, 0.3)',
};

const aChar = {
    color: '#fff',
};

const logoText = {
    fontSize: '0.8125rem',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
};

const navStyle = {
    height: '100%',
};

const ulStyle = {
    display: 'flex',
    gap: '1.5rem',
    listStyle: 'none',
    height: '100%',
    alignItems: 'center',
};

const linkStyle = {
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    padding: '1.1rem 0',
    display: 'inline-block',
    fontFamily: "'Inter', sans-serif",
};

const hamburgerStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const mobileMenuOverlay = {
    position: 'absolute',
    top: 'var(--nav-height)',
    left: 0,
    width: '100%',
    background: 'var(--bg-primary)',
    borderBottom: '1px solid var(--border-color)',
    padding: '1rem 1.5rem 2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    zIndex: 999,
};

const mobileUlStyle = {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
};

const mobileLinkStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
};

export default Navbar;
