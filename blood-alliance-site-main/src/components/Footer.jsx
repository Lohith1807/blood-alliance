import React from 'react';

const Footer = () => {
    return (
        <footer style={footerStyle}>
            <div className="container" style={footerWrapper}>
                <div style={brand}>
                    <span style={{ color: 'var(--rh-red)', fontWeight: '800' }}>BLOOD</span> ALLIANCE ANA
                </div>
                <div style={copy}>
                    © 2025 Distributed Operations. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

const footerStyle = {
    padding: '1.5rem 0',
    background: '#111',
    borderTop: '1px solid var(--border-color)',
    marginTop: '4rem',
};

const footerWrapper = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

const brand = {
    fontSize: '0.85rem',
    letterSpacing: '0.5px',
};

const copy = {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
};

export default Footer;
