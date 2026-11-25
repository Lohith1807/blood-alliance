import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import styles from '@/css/Rules.module.css';

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
        <section className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>

            {/* LAZY CWL PROTOCOL */}
            <motion.div
                id="cwl-rules"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={sectionVariants}
                className={styles.sectionWrapper}
            >
                <div className={styles.sectionHeader}>
                    <div className={styles.techLabel}>CWL Rules</div>
                    <h2 className={styles.sectionTitle}>Lazy CWL Rules</h2>
                </div>

                <div className={styles.rulesGrid}>
                    <RuleModule
                        icon={<img src="/images/cwl-medal.png" alt="CWL" style={{ width: 22, height: 22, objectFit: 'contain' }} />}
                        title="What is a Lazy CWL?"
                        rules={[
                            "A relaxed CWL format for members who can’t commit to daily war attacks.",
                            "Focuses on enjoying CWL without the stress of perfect performance.",
                            "Designed for alts, farmers, and casual players who still want medals."
                        ]}
                        variants={itemVariants}
                    />
                    <RuleModule
                        icon={<img src="/images/swords.gif" alt="Participation" style={{ width: 22, height: 22, objectFit: 'contain' }} />}
                        title="Participation"
                        rules={[
                            "Use at least one attack per war — no complete inactivity.",
                            "Attack smart: avoid mismatched or rushed bases that waste stars.",
                            "Respect roster order — if you’re not in the lineup, wait for your turn.",
                            "After completion of attack, return to your FWA clan."
                        ]}
                        variants={itemVariants}
                    />
                    <RuleModule
                        icon={<img src="/images/throphies.png" alt="Rewards" style={{ width: 22, height: 22, objectFit: 'contain' }} />}
                        title="Rewards & Conduct"
                        rules={[
                            "CWL medals based on random selection — play fair and help the team climb!",
                            "If you’re online but not attacking, help plan or donate troops.",
                            "Toxic behavior, blaming, or rage-quitting is not tolerated — this is a chill CWL!"
                        ]}
                        variants={itemVariants}
                        fullWidth
                    />
                </div>

                <div className={styles.ctaBox}>
                    <a href="https://discord.gg/gGGEs5SV9z" target="_blank" rel="noopener noreferrer" className={`btn btn-secondary ${styles.ctaBtn}`}>
                        Join CWL Discussion <ExternalLink size={12} style={{ marginLeft: '8px' }} />
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
                className={styles.sectionWrapper}
                style={{ marginTop: '6rem', borderTop: '1px solid var(--border-color)', paddingTop: '6rem' }}
            >
                <div className={styles.sectionHeader}>
                    <div className={styles.techLabel}>Rules</div>
                    <h2 className={styles.sectionTitle}>Clan & Discord Rules</h2>
                </div>

                <div className={styles.rulesGrid}>
                    <RuleModule
                        icon={<img src="/images/clan-castle.png" alt="Clan Rules" style={{ width: 22, height: 22, objectFit: 'contain' }} />}
                        title="Clan Rules"
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
                        icon={
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865f2" aria-hidden="true">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                        }
                        title="Server Rules"
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

                <div className={styles.ctaBox}>
                    <a href="https://discord.gg/gGGEs5SV9z" target="_blank" rel="noopener noreferrer" className={`btn btn-primary ${styles.ctaBtn} ${styles.ctaBtnPrimary}`}>
                        Join our Discord <ExternalLink size={12} style={{ marginLeft: '8px' }} />
                    </a>
                </div>
            </motion.div>
        </section>
    );
};

const RuleModule = ({ icon, title, rules, fullWidth, variants }) => (
    <motion.div
        variants={variants}
        className={styles.card}
        style={{
            gridColumn: fullWidth ? '1 / -1' : 'auto'
        }}
    >
        <div className={styles.cardHeader}>
            <div className={styles.iconBox}>{icon}</div>
            <h3 className={`mono ${styles.cardTitle}`}>{title}</h3>
        </div>
        <ul className={styles.list}>
            {rules.map((rule, i) => (
                <motion.li
                    key={i}
                    className={styles.listItem}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <span className={styles.bullet}>{String(i + 1).padStart(2, '0')}</span>
                    <span>{rule}</span>
                </motion.li>
            ))}
        </ul>
    </motion.div>
);

export default Rules;
