/**
 * Single Source of Configuration
 * 
 * This file centralizes all constants and configuration values for the application.
 * Note: Sensitive environment variables (secrets) should be accessed directly via 
 * process.env (Node) or import.meta.env (Vite) to ensure build tools handle them correctly.
 */

const CONFIG = {
    // API Configuration
    api: {
        baseUrl: '/api',
        endpoints: {
            clans: '/api/clans',
            players: '/api/players',
        },
        timeout: 10000,
    },

    // Feature Flags & UI Constants
    ui: {
        navHeight: 'var(--nav-height)',
        colors: {
            primary: 'var(--rh-red)',
            muted: 'var(--text-muted)',
        },
    },

    // Metadata
    meta: {
        title: 'Blood Alliance',
        orgName: 'BLOOD ALLIANCE',
        discordUrl: '#', // Placeholder
    }
};

export default CONFIG;
