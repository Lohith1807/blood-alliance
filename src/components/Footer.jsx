import React from 'react';
import styles from '@/css/Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.footerWrapper}`}>
                <div className={styles.brand}>
                    <span className={styles.brandHighlight}>BLOOD</span> ALLIANCE
                </div>
                <div className={styles.copy}>
                    © 2025 Distributed Operations. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
