import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Award, Target, MessageSquare, Scale, Users, ExternalLink } from 'lucide-react';

const Rules = () => {
    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <section className="container" style={{ padding: '6rem 0' }}>

            {/* LAZY CWL PROTOCOL */}
            <motion.div
                id="cwl-rules"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={sectionVariants}
                style={sectionWrapper}
            >
                <div style={sectionHeader}>
                    <div style={techLabel}>MODULE_01: CWL_PROTOCOLS</div>
                    <h2 style={sectionTitle}>Lazy CWL Operational Standards</h2>
                </div>

                <div style={rulesGrid}>
                    <RuleModule
                        icon={<Zap size={18} />}
                        title="PROTOCOL_DEFINITION"
                        rules={[
                            "A relaxed CWL format for members who can’t commit to daily war attacks.",
                            "Focuses on enjoying CWL without the stress of perfect performance.",
                            "Designed for alts, farmers, and casual players who still want medals."
                        ]}
                        variants={itemVariants}
                    />
                    <RuleModule
                        icon={<Target size={18} />}
                        title="PARTICIPATION_RULES"
                        rules={[
                            "Use at least one attack per war — no complete inactivity.",
                            "Attack smart: avoid mismatched or rushed bases that waste stars.",
                            "Respect roster order — if you’re not in the lineup, wait for your turn.",
                            "After completion of attack, return to your FWA clan."
                        ]}
                        variants={itemVariants}
                    />
                    <RuleModule
                        icon={<Award size={18} />}
                        title="REWARDS_CONDUCT"
                        rules={[
                            "CWL medals based on random selection — play fair and help the team climb!",
                            "If you’re online but not attacking, help plan or donate troops.",
                            "Toxic behavior, blaming, or rage-quitting is not tolerated — this is a chill CWL!"
                        ]}
                        variants={itemVariants}
                        fullWidth
                    />
                </div>

                <div style={ctaBox}>
                    <a href="https://discord.gg/gGGEs5SV9z" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={ctaBtnStyle}>
                        JOIN_CWL_DISCUSSION <ExternalLink size={12} style={{ marginLeft: '8px' }} />
                    </a>
                </div>
            </motion.div>

            {/* GLOBAL ALLIANCE PROTOCOL */}
            <motion.div
                id="rules"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={sectionVariants}
                style={{ ...sectionWrapper, marginTop: '6rem', borderTop: '1px solid var(--border-color)', paddingTop: '6rem' }}
            >
                <div style={sectionHeader}>
                    <div style={techLabel}>MODULE_02: GLOBAL_ALLIANCE_GOVERNANCE</div>
                    <h2 style={sectionTitle}>Alliance & Server Protocols</h2>
                </div>

                <div style={rulesGrid}>
                    <RuleModule
                        icon={<Users size={18} />}
                        title="CLAN_GOVERNANCE"
                        rules={[
                            "Be active daily and participate in wars and CWL.",
                            "Always use both war attacks — missing attacks may lead to demotion.",
                            "Donate correct troops only as requested.",
                            "Respect all members — teamwork builds victory.",
                            "No rushed bases allowed in main clan — use feeder clans if needed.",
                            "Maintain a healthy competitive spirit, no toxicity."
                        ]}
                        variants={itemVariants}
                    />
                    <RuleModule
                        icon={<MessageSquare size={18} />}
                        title="SERVER_COMPLIANCE"
                        rules={[
                            "Respect everyone — no harassment, hate speech, or spam.",
                            "Keep conversations in their appropriate channels.",
                            "No self-promotion or external links without admin approval.",
                            "Use proper language — this is a family-friendly server.",
                            "Follow all Discord Terms of Service.",
                            "Breaking these rules may lead to a kick or permanent ban."
                        ]}
                        variants={itemVariants}
                    />
                </div>

                <div style={ctaBox}>
                    <a href="https://discord.gg/gGGEs5SV9z" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={ctaBtnStylePrimary}>
                        JOIN_OUR_DISCORD <ExternalLink size={12} style={{ marginLeft: '8px' }} />
                    </a>
                </div>
            </motion.div>
        </section>
    );
};

const RuleModule = ({ icon, title, rules, fullWidth, variants }) => (
    <motion.div
        variants={variants}
        className="protocol-item"
        style={{
            ...cardStyle,
            gridColumn: fullWidth ? '1 / -1' : 'auto'
        }}
    >
        <div style={cardHeader}>
            <div style={iconBox}>{icon}</div>
            <h3 className="mono" style={cardTitle}>{title}</h3>
        </div>
        <ul style={listStyle}>
            {rules.map((rule, i) => (
                <motion.li
                    key={i}
                    style={listItem}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <span style={bullet}>{String(i + 1).padStart(2, '0')}</span>
                    <span>{rule}</span>
                </motion.li>
            ))}
        </ul>
    </motion.div>
);

const sectionWrapper = {
    marginBottom: '2rem',
};

const sectionHeader = {
    marginBottom: '3rem',
    textAlign: 'center',
};

const techLabel = {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.7rem',
    color: 'var(--rh-red)',
    fontWeight: '700',
    letterSpacing: '0.15em',
    marginBottom: '0.5rem',
};

const sectionTitle = {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em',
};

const rulesGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
};

const cardStyle = {
    padding: '1.5rem',
    borderRadius: '2px',
    background: 'linear-gradient(135deg, #212121 0%, #1a1a1a 100%)',
    border: '1px solid var(--border-color)',
};

const cardHeader = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '1.25rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
};

const iconBox = {
    color: 'var(--rh-red)',
    opacity: 0.9,
};

const cardTitle = {
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.1em',
    color: 'var(--text-primary)',
};

const listStyle = {
    listStyle: 'none',
};

const listItem = {
    fontSize: '0.8125rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.75rem',
    display: 'flex',
    gap: '0.75rem',
    lineHeight: '1.5',
};

const bullet = {
    color: 'var(--rh-red)',
    fontWeight: '700',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.7rem',
    opacity: 0.8,
    paddingTop: '2px',
};

const ctaBox = {
    marginTop: '2.5rem',
    display: 'flex',
    justifyContent: 'center',
};

const ctaBtnStyle = {
    fontSize: '0.75rem',
    padding: '0.625rem 1.25rem',
    letterSpacing: '1px',
    fontWeight: '700',
    fontFamily: 'JetBrains Mono, monospace',
    borderRadius: '2px',
};

const ctaBtnStylePrimary = {
    ...ctaBtnStyle,
    background: 'var(--rh-red)',
    color: '#fff',
    border: 'none',
};

export default Rules;
