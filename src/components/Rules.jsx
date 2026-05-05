import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Award, Target, MessageSquare, Users, ExternalLink } from 'lucide-react';
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
        <section className="container" style={{ padding: '6rem 0' }}>

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
                        icon={<Zap size={18} />}
                        title="What is a Lazy CWL?"
                        rules={[
                            "A relaxed CWL format for members who can’t commit to daily war attacks.",
                            "Focuses on enjoying CWL without the stress of perfect performance.",
                            "Designed for alts, farmers, and casual players who still want medals."
                        ]}
                        variants={itemVariants}
                    />
                    <RuleModule
                        icon={<Target size={18} />}
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
                        icon={<Award size={18} />}
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
                    <div className={styles.techLabel}>Clan Protocols</div>
                    <h2 className={styles.sectionTitle}>Alliance & Server Protocols</h2>
                </div>

                <div className={styles.rulesGrid}>
                    <RuleModule
                        icon={<Users size={18} />}
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
                        icon={<MessageSquare size={18} />}
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
