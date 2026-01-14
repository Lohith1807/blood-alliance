import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Navbar = ({ activeTab, setActiveTab }) => {
    const [activeSection, setActiveSection] = useState('home');

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

    return (
        <header style={headerStyle}>
            <div className="container" style={containerStyle}>
                <motion.div
                    style={logoStyle}
                    onClick={() => handleNavClick('home', 'home')}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    whileHover={{ scale: 1.02 }}
                >
                    <span style={{ color: 'var(--rh-red)' }}>BLOOD</span> ALLIANCE ANA
                </motion.div>

                <nav style={navStyle}>
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

                <a
                    href="https://discord.gg/gGGEs5SV9z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ height: '32px', padding: '0 0.75rem', fontSize: '0.8rem', borderRadius: '2px' }}
                >
                    Join Discord
                </a>
            </div>
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

const logoStyle = {
    fontSize: '0.875rem',
    fontWeight: '800',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    fontFamily: 'system-ui, sans-serif',
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

export default Navbar;
