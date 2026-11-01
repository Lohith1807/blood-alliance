import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Plus, Trash2, CheckCircle2, AlertCircle, Save,
    Shield, RefreshCw, Layers, Award, Users, Crown, Star,
    ExternalLink, Sparkles, Hash, X, Maximize2, Check, ArrowLeft,
    Swords, AlertTriangle, ShieldAlert, RotateCcw, Code2, Edit3, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from '@/css/ClanRulesManagement.module.css';

const DEFAULT_WAR_RULES = {
    win: {
        header: '🟩 **This war has been declared a win as per FWA rules.**',
        title: '⚔️ **WIN WAR INSTRUCTIONS** ⚔️',
        instructions: [
            '1st Attack - ⭐⭐⭐(3 Stars) on your mirror (Compulsory)',
            '2nd attack - ⭐(1 Star) on any base.',
            'Last 8 hours - go for ⭐⭐⭐(3 Stars) (clean ups)'
        ],
        important: [
            'Use both attacks',
            'Don’t rush attacks',
            'Ask if you need help'
        ],
        text: ''
    },
    lose: {
        header: '🟥 **This war has been declared a loss as per FWA rules.**',
        title: '⚔️ **LOSE WAR INSTRUCTIONS** ⚔️',
        instructions: [
            '1st Attack - ⭐⭐(2 Stars) on your mirror (Compulsory)',
            '2nd attack - ⭐(1 Star) on any base.',
            'Last 8 hours - go for ⭐⭐(2 Stars) (clean ups)'
        ],
        important: [
            'Use both attacks',
            'No extra attacks without permission',
            'Don’t rush attacks',
            'Ask if you need help'
        ],
        text: ''
    },
    bl: {
        header: "🛡️ This is a blacklisted war — we're not backing down!",
        title: '{cocfight} **Instructions:**',
        instructions: [
            'Change your war base to a real war base — no FWA layouts!',
            'Attack freely and aim for ⭐️⭐️⭐️ 3 stars on both hits.',
            'Coordinate with your team for cleanup and efficient hits.'
        ],
        goals: [
            '30 war bases changed',
            '60% destruction',
            'Win the war 💪'
        ],
        notes: [
            'Need a base? Visit: clashofclans-layouts.com',
            'After war ends: Switch your base back to FWA format immediately!'
        ],
        text: ''
    },
    mis: {
        header: '⚠️ **This is a mismatch war against a non-FWA clan!**',
        title: '{cocfight} **Instructions:**',
        instructions: [
            'Change your war base to a real war base — no FWA layouts!',
            'Attack freely and aim for ⭐️⭐️⭐️ 3 stars on both hits.',
            'Coordinate with your team for cleanup and efficient hits.'
        ],
        important: [
            'Use both attacks',
            'Don’t rush attacks',
            'Switch your base back to FWA format after war ends!'
        ],
        text: ''
    }
};

const generateWarText = (key, data) => {
    if (!data) return '';
    const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    const header = data.header || '';
    const title = data.title || '';
    const instructions = Array.isArray(data.instructions) ? data.instructions.filter(Boolean) : [];

    if (key === 'win' || key === 'lose') {
        const important = Array.isArray(data.important) ? data.important.filter(Boolean) : [];
        const lines = [
            '',
            divider,
            header,
            divider,
            '',
            title,
            ''
        ];
        instructions.forEach(ins => lines.push(`{rarrow} ${ins}`));
        if (important.length > 0) {
            lines.push('');
            lines.push('📌 **Important**');
            lines.push('');
            important.forEach(imp => lines.push(`{rarrow} ${imp}`));
        }
        return lines.join('\n');
    }

    if (key === 'bl') {
        const goals = Array.isArray(data.goals) ? data.goals.filter(Boolean) : [];
        const notes = Array.isArray(data.notes) ? data.notes.filter(Boolean) : [];
        const lines = [
            '',
            divider,
            header,
            divider,
            '',
            title,
            ''
        ];
        instructions.forEach(ins => lines.push(`🔸 ${ins}`));
        if (goals.length > 0) {
            lines.push('');
            lines.push('📌 **War Goals:**');
            goals.forEach(g => lines.push(g));
        }
        if (notes.length > 0) {
            lines.push('');
            lines.push(`📚 **Need a base? Visit:** ${notes[0] || 'clashofclans-layouts.com'}`);
            if (notes[1]) {
                lines.push('');
                lines.push('🔁 **After war ends:**');
                lines.push(notes[1]);
            }
        }
        return lines.join('\n');
    }

    if (key === 'mis') {
        const important = Array.isArray(data.important) ? data.important.filter(Boolean) : [];
        const lines = [
            '',
            divider,
            header,
            divider,
            '',
            title,
            ''
        ];
        instructions.forEach(ins => lines.push(`🔸 ${ins}`));
        if (important.length > 0) {
            lines.push('');
            lines.push('📌 **Important:**');
            lines.push('');
            important.forEach(imp => lines.push(`🔸 ${imp}`));
        }
        return lines.join('\n');
    }

    return data.text || '';
};

const ClanRulesManagement = () => {
    const { token, user } = useAuth();

    const [clans, setClans] = useState([]);
    const [selectedTag, setSelectedTag] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('embed'); // 'embed' | 'war'

    // Clan Rules Embed state
    const [formData, setFormData] = useState({
        title: '{clanName} Rules',
        color: '#E74C3C',
        image: '',
        thumbnail: '',
        footer: { text: '', iconURL: '' },
        rules: []
    });
    const [newRuleText, setNewRuleText] = useState('');

    // War Rules state
    const [warRules, setWarRules] = useState(DEFAULT_WAR_RULES);
    const [activeWarTab, setActiveWarTab] = useState('win'); // 'win' | 'lose' | 'bl' | 'mis'
    const [warRawMode, setWarRawMode] = useState(false);
    const [newWarInstruction, setNewWarInstruction] = useState('');
    const [newWarImportant, setNewWarImportant] = useState('');
    const [newWarGoal, setNewWarGoal] = useState('');
    const [newWarNote, setNewWarNote] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingWar, setSavingWar] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    const fetchClanRules = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/clan-rules', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.clans) {
                // Ensure clans are sorted in order
                const sortedClans = [...data.clans].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
                setClans(sortedClans);

                // If currently open clan is in the list, keep formData synced
                if (selectedTag) {
                    const currentClan = sortedClans.find(c => c.tag === selectedTag);
                    if (currentClan) {
                        setFormData({
                            title: currentClan.title || `${currentClan.name} Rules`,
                            color: currentClan.color || '#E74C3C',
                            image: currentClan.image || '',
                            thumbnail: currentClan.thumbnail || currentClan.badgeUrls?.large || currentClan.badgeUrls?.medium || '',
                            footer: currentClan.footer || { text: '', iconURL: '' },
                            rules: Array.isArray(currentClan.rules) ? currentClan.rules : []
                        });
                        if (currentClan.warrules) {
                            const rawWar = currentClan.warrules;
                            const initialized = {
                                win: { ...DEFAULT_WAR_RULES.win, ...(rawWar.win || {}) },
                                lose: { ...DEFAULT_WAR_RULES.lose, ...(rawWar.lose || {}) },
                                bl: { ...DEFAULT_WAR_RULES.bl, ...(rawWar.bl || {}) },
                                mis: { ...DEFAULT_WAR_RULES.mis, ...(rawWar.mis || {}) }
                            };
                            ['win', 'lose', 'bl', 'mis'].forEach(k => {
                                if (!initialized[k].text) {
                                    initialized[k].text = generateWarText(k, initialized[k]);
                                }
                            });
                            setWarRules(initialized);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load clan rules:', err);
            showFeedback('Failed to load clan rules from bot server', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClanRules();
    }, []);

    // Listen for Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                setIsModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    // Prevent background scrolling when full-screen modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

    const showFeedback = (message, type = 'success') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
    };

    // Open clan editor in full-screen modal
    const handleOpenClanModal = (clan) => {
        setSelectedTag(clan.tag);
        setFormData({
            title: clan.title || `${clan.name} Rules`,
            color: clan.color || '#E74C3C',
            image: clan.image || '',
            thumbnail: clan.thumbnail || clan.badgeUrls?.large || clan.badgeUrls?.medium || '',
            footer: clan.footer || { text: '', iconURL: '' },
            rules: Array.isArray(clan.rules) ? clan.rules : []
        });
        setNewRuleText('');

        // Initialize war rules
        const rawWar = clan.warrules || DEFAULT_WAR_RULES;
        const initializedWar = {
            win: { ...DEFAULT_WAR_RULES.win, ...(rawWar.win || {}) },
            lose: { ...DEFAULT_WAR_RULES.lose, ...(rawWar.lose || {}) },
            bl: { ...DEFAULT_WAR_RULES.bl, ...(rawWar.bl || {}) },
            mis: { ...DEFAULT_WAR_RULES.mis, ...(rawWar.mis || {}) }
        };

        ['win', 'lose', 'bl', 'mis'].forEach(k => {
            if (!initializedWar[k].text) {
                initializedWar[k].text = generateWarText(k, initializedWar[k]);
            }
        });

        setWarRules(initializedWar);
        setActiveWarTab('win');
        setActiveSection('embed');
        setWarRawMode(false);
        setNewWarInstruction('');
        setNewWarImportant('');
        setNewWarGoal('');
        setNewWarNote('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Quick helper to auto-fill clan badge as thumbnail
    const handleUseClanBadge = () => {
        if (!selectedClan) return;
        const badge = selectedClan.badgeUrls?.large || selectedClan.badgeUrls?.medium || selectedClan.badgeUrls?.small;
        if (badge) {
            setFormData({ ...formData, thumbnail: badge });
        }
    };

    // Clan Embed Rule operations
    const handleAddRule = (e) => {
        e.preventDefault();
        const trimmed = newRuleText.trim();
        if (!trimmed) return;

        setFormData({
            ...formData,
            rules: [...formData.rules, trimmed]
        });
        setNewRuleText('');
    };

    const handleUpdateRule = (index, text) => {
        const next = [...formData.rules];
        next[index] = text;
        setFormData({ ...formData, rules: next });
    };

    const handleDeleteRule = (index) => {
        const next = [...formData.rules];
        next.splice(index, 1);
        setFormData({ ...formData, rules: next });
    };

    // War Rules Field Operations
    const handleUpdateWarScenarioField = (field, value) => {
        setWarRules(prev => {
            const currentScenario = prev[activeWarTab] || {};
            const updatedScenario = { ...currentScenario, [field]: value };
            if (!warRawMode) {
                updatedScenario.text = generateWarText(activeWarTab, updatedScenario);
            }
            return { ...prev, [activeWarTab]: updatedScenario };
        });
    };

    // War Instruction operations
    const handleAddWarInstruction = (e) => {
        e?.preventDefault();
        const trimmed = newWarInstruction.trim();
        if (!trimmed) return;
        setWarRules(prev => {
            const currentScenario = prev[activeWarTab] || {};
            const list = Array.isArray(currentScenario.instructions) ? [...currentScenario.instructions] : [];
            list.push(trimmed);
            const updatedScenario = { ...currentScenario, instructions: list };
            if (!warRawMode) {
                updatedScenario.text = generateWarText(activeWarTab, updatedScenario);
            }
            return { ...prev, [activeWarTab]: updatedScenario };
        });
        setNewWarInstruction('');
    };

    const handleUpdateWarInstruction = (index, value) => {
        setWarRules(prev => {
            const currentScenario = prev[activeWarTab] || {};
            const list = Array.isArray(currentScenario.instructions) ? [...currentScenario.instructions] : [];
            list[index] = value;
            const updatedScenario = { ...currentScenario, instructions: list };
            if (!warRawMode) {
                updatedScenario.text = generateWarText(activeWarTab, updatedScenario);
            }
            return { ...prev, [activeWarTab]: updatedScenario };
        });
    };

    const handleDeleteWarInstruction = (index) => {
        setWarRules(prev => {
            const currentScenario = prev[activeWarTab] || {};
            const list = Array.isArray(currentScenario.instructions) ? [...currentScenario.instructions] : [];
            list.splice(index, 1);
            const updatedScenario = { ...currentScenario, instructions: list };
            if (!warRawMode) {
                updatedScenario.text = generateWarText(activeWarTab, updatedScenario);
            }
            return { ...prev, [activeWarTab]: updatedScenario };
        });
    };

    // War Important operations (win, lose, mis)
    const handleAddWarImportant = (e) => {
        e?.preventDefault();
        const trimmed = newWarImportant.trim();
        if (!trimmed) return;
        setWarRules(prev => {
            const currentScenario = prev[activeWarTab] || {};
            const list = Array.isArray(currentScenario.important) ? [...currentScenario.important] : [];
            list.push(trimmed);
            const updatedScenario = { ...currentScenario, important: list };
            if (!warRawMode) {
                updatedScenario.text = generateWarText(activeWarTab, updatedScenario);
            }
            return { ...prev, [activeWarTab]: updatedScenario };
        });
        setNewWarImportant('');
    };

    const handleUpdateWarImportant = (index, value) => {
        setWarRules(prev => {
            const currentScenario = prev[activeWarTab] || {};
            const list = Array.isArray(currentScenario.important) ? [...currentScenario.important] : [];
            list[index] = value;
            const updatedScenario = { ...currentScenario, important: list };
            if (!warRawMode) {
                updatedScenario.text = generateWarText(activeWarTab, updatedScenario);
            }
            return { ...prev, [activeWarTab]: updatedScenario };
        });
    };

    const handleDeleteWarImportant = (index) => {
        setWarRules(prev => {
            const currentScenario = prev[activeWarTab] || {};
            const list = Array.isArray(currentScenario.important) ? [...currentScenario.important] : [];
            list.splice(index, 1);
            const updatedScenario = { ...currentScenario, important: list };
            if (!warRawMode) {
                updatedScenario.text = generateWarText(activeWarTab, updatedScenario);
            }
            return { ...prev, [activeWarTab]: updatedScenario };
        });
    };

    // War Goals & Notes operations (bl)
    const handleAddWarGoal = (e) => {
        e?.preventDefault();
        const trimmed = newWarGoal.trim();
        if (!trimmed) return;
        setWarRules(prev => {
            const currentScenario = prev.bl || {};
            const list = Array.isArray(currentScenario.goals) ? [...currentScenario.goals] : [];
            list.push(trimmed);
            const updatedScenario = { ...currentScenario, goals: list };
            if (!warRawMode) {
                updatedScenario.text = generateWarText('bl', updatedScenario);
            }
            return { ...prev, bl: updatedScenario };
        });
        setNewWarGoal('');
    };

    const handleUpdateWarGoal = (index, value) => {
        setWarRules(prev => {
            const currentScenario = prev.bl || {};
            const list = Array.isArray(currentScenario.goals) ? [...currentScenario.goals] : [];
            list[index] = value;
            const updatedScenario = { ...currentScenario, goals: list };
            if (!warRawMode) {
                updatedScenario.text = generateWarText('bl', updatedScenario);
            }
            return { ...prev, bl: updatedScenario };
        });
    };

    const handleDeleteWarGoal = (index) => {
        setWarRules(prev => {
            const currentScenario = prev.bl || {};
            const list = Array.isArray(currentScenario.goals) ? [...currentScenario.goals] : [];
            list.splice(index, 1);
            const updatedScenario = { ...currentScenario, goals: list };
            if (!warRawMode) {
                updatedScenario.text = generateWarText('bl', updatedScenario);
            }
            return { ...prev, bl: updatedScenario };
        });
    };

    const handleAddWarNote = (e) => {
        e?.preventDefault();
        const trimmed = newWarNote.trim();
        if (!trimmed) return;
        setWarRules(prev => {
            const currentScenario = prev.bl || {};
            const list = Array.isArray(currentScenario.notes) ? [...currentScenario.notes] : [];
            list.push(trimmed);
            const updatedScenario = { ...currentScenario, notes: list };
            if (!warRawMode) {
                updatedScenario.text = generateWarText('bl', updatedScenario);
            }
            return { ...prev, bl: updatedScenario };
        });
        setNewWarNote('');
    };

    const handleUpdateWarNote = (index, value) => {
        setWarRules(prev => {
            const currentScenario = prev.bl || {};
            const list = Array.isArray(currentScenario.notes) ? [...currentScenario.notes] : [];
            list[index] = value;
            const updatedScenario = { ...currentScenario, notes: list };
            if (!warRawMode) {
                updatedScenario.text = generateWarText('bl', updatedScenario);
            }
            return { ...prev, bl: updatedScenario };
        });
    };

    const handleDeleteWarNote = (index) => {
        setWarRules(prev => {
            const currentScenario = prev.bl || {};
            const list = Array.isArray(currentScenario.notes) ? [...currentScenario.notes] : [];
            list.splice(index, 1);
            const updatedScenario = { ...currentScenario, notes: list };
            if (!warRawMode) {
                updatedScenario.text = generateWarText('bl', updatedScenario);
            }
            return { ...prev, bl: updatedScenario };
        });
    };

    // Raw text update
    const handleUpdateRawText = (text) => {
        setWarRules(prev => {
            const currentScenario = prev[activeWarTab] || {};
            return {
                ...prev,
                [activeWarTab]: {
                    ...currentScenario,
                    text
                }
            };
        });
    };

    const handleResyncFromFields = () => {
        setWarRules(prev => {
            const currentScenario = prev[activeWarTab] || {};
            const regenerated = generateWarText(activeWarTab, currentScenario);
            return {
                ...prev,
                [activeWarTab]: {
                    ...currentScenario,
                    text: regenerated
                }
            };
        });
        showFeedback(`Regenerated Discord text for ${activeWarTab.toUpperCase()} war from fields`);
    };

    const handleResetWarRules = () => {
        if (window.confirm('Reset all 4 war scenarios to Alliance standard template? Any unsaved edits will be lost.')) {
            const fresh = JSON.parse(JSON.stringify(DEFAULT_WAR_RULES));
            ['win', 'lose', 'bl', 'mis'].forEach(k => {
                fresh[k].text = generateWarText(k, fresh[k]);
            });
            setWarRules(fresh);
            showFeedback('War rules reset to alliance standard template.');
        }
    };

    // Save rules to API endpoint (clashbot + MongoDB)
    const handleSave = async () => {
        if (!selectedTag) return;
        setSaving(true);

        try {
            const res = await fetch('/api/clan-rules', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tag: selectedTag,
                    ...formData,
                    warrules: warRules
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update rules on bot server');

            showFeedback(data.message || 'Clan rules and war rules updated on Clash Bot server!');
            fetchClanRules();
        } catch (err) {
            showFeedback(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Save War Rules only
    const handleSaveWarRules = async () => {
        if (!selectedTag) return;
        setSavingWar(true);

        try {
            const res = await fetch('/api/clan-rules', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tag: selectedTag,
                    warrules: warRules
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update war rules on bot server');

            showFeedback(`War rules updated successfully for ${selectedClan?.name || selectedTag}!`);
            fetchClanRules();
        } catch (err) {
            showFeedback(err.message, 'error');
        } finally {
            setSavingWar(false);
        }
    };

    const selectedClan = clans.find(c => c.tag === selectedTag);
    const resolvedTitle = (formData.title || '{clanName} Rules').replace('{clanName}', selectedClan?.name || 'Clan');
    const accessiblePeople = selectedClan?.accessibleUsers || [];
    const currentWarScenario = warRules[activeWarTab] || DEFAULT_WAR_RULES[activeWarTab];

    // Helper for rendering Discord Markdown
    const renderMarkdownSpans = (text) => {
        if (!text) return '';
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} style={{ color: '#fff' }}>{part.slice(2, -2)}</strong>;
            }
            if (part.includes('http') || part.includes('.com')) {
                return <span key={i} className={styles.discordLinkText}>{part}</span>;
            }
            return part;
        });
    };

    const renderFormattedDiscordContent = (text, scenarioKey) => {
        if (!text) return null;
        const lines = text.split('\n');

        return lines.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) {
                return <div key={idx} style={{ height: '0.35rem' }} />;
            }

            // Horizontal divider
            if (trimmed.includes('━━━━')) {
                return (
                    <div key={idx} className={styles.discordDivider}>
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    </div>
                );
            }

            // Arrow instruction: {rarrow} text
            if (trimmed.startsWith('{rarrow}')) {
                const content = trimmed.replace('{rarrow}', '').trim();
                return (
                    <div key={idx} className={styles.discordWarItemRow}>
                        <span className={styles.discordArrowBullet}>➔</span>
                        <span>{renderMarkdownSpans(content)}</span>
                    </div>
                );
            }

            // Diamond bullet: 🔸 text
            if (trimmed.startsWith('🔸')) {
                const content = trimmed.replace('🔸', '').trim();
                return (
                    <div key={idx} className={styles.discordWarItemRow}>
                        <span className={styles.discordDiamondBullet}>🔸</span>
                        <span>{renderMarkdownSpans(content)}</span>
                    </div>
                );
            }

            // Subheadings like 📌 **Important** or 📚
            if (trimmed.startsWith('📌') || trimmed.startsWith('📚') || trimmed.startsWith('🔁')) {
                return (
                    <div key={idx} className={styles.discordSubHeading}>
                        {renderMarkdownSpans(trimmed)}
                    </div>
                );
            }

            // Title or general line
            const resolvedLine = trimmed.replace('{cocfight}', '⚔️');
            return (
                <div key={idx} style={{ lineHeight: 1.45 }}>
                    {renderMarkdownSpans(resolvedLine)}
                </div>
            );
        });
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>
                            <FileText size={26} style={{ color: 'var(--rh-red)' }} />
                            Discord Clan & War Rules Embed Manager
                        </h1>
                        <p className={styles.subtitle}>
                            Manage rule protocols, live Discord clan embeds, and automated war instructions for alliance clans.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button
                            onClick={fetchClanRules}
                            className="btn btn-secondary"
                            disabled={loading || saving || savingWar}
                            style={{ height: 38 }}
                        >
                            <RefreshCw size={14} style={{ marginRight: 6 }} className={loading ? 'spin' : ''} /> Refresh
                        </button>
                    </div>
                </div>

                {feedback.message && !isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '3px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8125rem',
                            backgroundColor: feedback.type === 'error' ? 'rgba(238, 0, 0, 0.15)' : 'rgba(0, 180, 50, 0.15)',
                            border: `1px solid ${feedback.type === 'error' ? 'var(--rh-red)' : '#00b432'}`,
                            color: feedback.type === 'error' ? '#ff6b6b' : '#4ade80'
                        }}
                    >
                        {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                        <span>{feedback.message}</span>
                    </motion.div>
                )}

                {/* 1. LIST OF CLANS IN ORDER */}
                <div>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitle}>
                            <Layers size={15} style={{ color: 'var(--rh-red)' }} />
                            Alliance Clans in Order ({clans.length})
                        </div>
                    </div>

                    {clans.length > 0 ? (
                        <div className={styles.clansGrid}>
                            {clans.map((clan, idx) => {
                                const badge = clan.badgeUrls?.small || clan.badgeUrls?.medium;
                                const rulesCount = Array.isArray(clan.rules) ? clan.rules.length : 0;
                                const managersCount = Array.isArray(clan.accessibleUsers) ? clan.accessibleUsers.length : 0;
                                const orderNum = (clan.order !== undefined ? clan.order + 1 : idx + 1);

                                return (
                                    <div
                                        key={clan.tag}
                                        onClick={() => handleOpenClanModal(clan)}
                                        className={styles.clanCard}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                handleOpenClanModal(clan);
                                            }
                                        }}
                                    >
                                        <div className={styles.rankBadge}>
                                            #{orderNum}
                                        </div>

                                        {badge ? (
                                            <img src={badge} alt={clan.name} className={styles.clanBadgeImg} />
                                        ) : (
                                            <Award size={38} style={{ color: 'var(--rh-red)', flexShrink: 0 }} />
                                        )}

                                        <div className={styles.clanInfo}>
                                            <div className={styles.clanName} title={clan.name}>
                                                {clan.name}
                                            </div>
                                            <div className={styles.clanTag}>{clan.tag}</div>

                                            <div className={styles.clanMeta}>
                                                <span className={styles.rulesCountBadge}>
                                                    {rulesCount === 1 ? '1 Rule' : `${rulesCount} Rules`}
                                                </span>
                                                <span className={styles.warBadgeMainCard}>
                                                    ⚔️ War Rules
                                                </span>
                                                <span className={styles.managersBadge}>
                                                    {managersCount} Manager{managersCount === 1 ? '' : 's'}
                                                </span>
                                                {clan.clanLevel && (
                                                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                                                        Lvl {clan.clanLevel}
                                                    </span>
                                                )}
                                            </div>

                                            <div className={styles.editOverlayHint}>
                                                <Maximize2 size={12} />
                                                <span>Click to edit clan & war rules</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : !loading && (
                        <div className={styles.emptyCard}>
                            <Shield size={38} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Clans Assigned</h3>
                            <p style={{ maxWidth: 450, margin: '0 auto', fontSize: '0.85rem' }}>
                                Your account currently does not have access to manage any clans. Please ask an Alliance Admin or Owner to assign clans to your account in User Management.
                            </p>
                        </div>
                    )}
                </div>

                {/* 2. FULL SCREEN POPUP MODAL */}
                {typeof document !== 'undefined' && createPortal(
                    <AnimatePresence>
                        {isModalOpen && selectedClan && (
                            <div
                                className={styles.modalBackdrop}
                                onClick={handleCloseModal}
                            >
                                <motion.div
                                    className={styles.modalContainer}
                                    onClick={(e) => e.stopPropagation()}
                                    initial={{ opacity: 0, scale: 0.99 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.99 }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                >
                                    {/* MODAL HEADER */}
                                    <div className={styles.modalHeader}>
                                        <div className={styles.modalHeaderInner}>
                                            <div className={styles.modalHeaderLeft}>
                                                {selectedClan.badgeUrls?.medium || selectedClan.badgeUrls?.small ? (
                                                    <img
                                                        src={selectedClan.badgeUrls?.medium || selectedClan.badgeUrls?.small}
                                                        alt={selectedClan.name}
                                                        className={styles.modalClanBadge}
                                                    />
                                                ) : (
                                                    <Award size={34} style={{ color: 'var(--rh-red)' }} />
                                                )}
                                                <div className={styles.modalClanInfo}>
                                                    <div className={styles.modalClanTitle}>
                                                        {selectedClan.name}
                                                        <span className={styles.rankBadge} style={{ position: 'static' }}>
                                                            #{selectedClan.order !== undefined ? selectedClan.order + 1 : 1}
                                                        </span>
                                                    </div>
                                                    <div className={styles.modalClanTag}>
                                                        {selectedClan.tag}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <button
                                                    onClick={handleSave}
                                                    className={`btn btn-primary ${styles.saveBtnHeader}`}
                                                    disabled={saving || savingWar}
                                                >
                                                    <Save size={15} style={{ marginRight: 6 }} />
                                                    <span className={styles.saveBtnFullText}>{saving ? 'Saving...' : 'Save All Changes'}</span>
                                                    <span className={styles.saveBtnShortText}>{saving ? '...' : 'Save'}</span>
                                                </button>
                                                <button
                                                    onClick={handleCloseModal}
                                                    className={styles.modalCloseBtn}
                                                    title="Close (Esc)"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* MODAL SCROLL AREA */}
                                    <div className={styles.modalScrollArea}>
                                        <div className={styles.modalInnerContent}>
                                            {feedback.message && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        borderRadius: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        fontSize: '0.8125rem',
                                                        backgroundColor: feedback.type === 'error' ? 'rgba(238, 0, 0, 0.15)' : 'rgba(0, 180, 50, 0.15)',
                                                        border: `1px solid ${feedback.type === 'error' ? 'var(--rh-red)' : '#00b432'}`,
                                                        color: feedback.type === 'error' ? '#ff6b6b' : '#4ade80'
                                                    }}
                                                >
                                                    {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                                    <span>{feedback.message}</span>
                                                </motion.div>
                                            )}

                                            {/* SECTION A: PEOPLE WHO HAVE ACCESS TO THIS CLAN */}
                                            <div className={styles.peopleCard}>
                                                <div className={styles.peopleHeader}>
                                                    <div className={styles.peopleTitle}>
                                                        <Users size={16} style={{ color: '#c084fc' }} />
                                                        People with Access to Manage {selectedClan.name}
                                                    </div>
                                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                                                        {accessiblePeople.length} Authorized Manager{accessiblePeople.length === 1 ? '' : 's'}
                                                    </span>
                                                </div>

                                                {accessiblePeople.length === 0 ? (
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                        No specific managers assigned. Alliance Owner and Admins have global access.
                                                    </div>
                                                ) : (
                                                    <div className={styles.peopleGrid}>
                                                        {accessiblePeople.map((person) => {
                                                            const initial = (person.email?.[0] || 'U').toUpperCase();
                                                            const isUserOwner = person.isOwner || person.email?.toLowerCase() === 'lohithreddy1819@gmail.com';
                                                            const isLeader = person.role === 'leader';
                                                            const isAdmin = person.role === 'admin';

                                                            return (
                                                                <div key={person.id} className={styles.personChip}>
                                                                    <div className={styles.personAvatar}>
                                                                        {isUserOwner ? <Crown size={12} style={{ color: '#fbbf24' }} /> : initial}
                                                                    </div>
                                                                    <span className={styles.personEmail}>
                                                                        {person.email}
                                                                    </span>
                                                                    <span className={`${styles.personBadge} ${
                                                                        isUserOwner ? styles.badgeOwner :
                                                                        isAdmin ? styles.badgeAdmin :
                                                                        styles.badgeLeader
                                                                    }`}>
                                                                        {isUserOwner ? 'OWNER' : isAdmin ? 'ADMIN' : 'LEADER'}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* SECTION QUICK NAVIGATION PILLS */}
                                            <div className={styles.sectionNav}>
                                                <button
                                                    type="button"
                                                    className={`${styles.sectionNavBtn} ${activeSection === 'embed' ? styles.sectionNavBtnActive : ''}`}
                                                    onClick={() => {
                                                        setActiveSection('embed');
                                                        document.getElementById('clan-embed-section')?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                >
                                                    <FileText size={15} /> Clan Rules Embed
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`${styles.sectionNavBtn} ${activeSection === 'war' ? styles.sectionNavBtnActive : ''}`}
                                                    onClick={() => {
                                                        setActiveSection('war');
                                                        document.getElementById('clan-war-rules-section')?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                >
                                                    <Swords size={15} /> War Rules Protocol (Win / Lose / BL / Mismatch)
                                                </button>
                                            </div>

                                            {/* SECTION B: EMBED EDITOR & LIVE DISCORD EMBED PREVIEW */}
                                            <div id="clan-embed-section" className={styles.mainLayout}>
                                                {/* LEFT: EMBED EDITOR */}
                                                <div className={styles.editorCard}>
                                                    <div className={styles.editorHeader}>
                                                        <div className={styles.editorTitle}>
                                                            <FileText size={18} style={{ color: 'var(--rh-red)' }} />
                                                            Discord Embed Settings
                                                        </div>
                                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                            Live Embed Editor
                                                        </span>
                                                    </div>

                                                    <div className={styles.editorBody}>
                                                        {/* Meta Fields */}
                                                        <div className={styles.configGrid}>
                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Embed Title</label>
                                                                <input
                                                                    type="text"
                                                                    className={styles.input}
                                                                    value={formData.title}
                                                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                                    placeholder="{clanName} Rules"
                                                                />
                                                                <small style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                                                    <code>{'{clanName}'}</code> will be replaced with {selectedClan.name}.
                                                                </small>
                                                            </div>

                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Embed Accent Color</label>
                                                                <div className={styles.colorPickerRow}>
                                                                    <input
                                                                        type="color"
                                                                        className={styles.colorBox}
                                                                        value={formData.color || '#E74C3C'}
                                                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        className={styles.input}
                                                                        value={formData.color}
                                                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                                        placeholder="#E74C3C"
                                                                        style={{ fontFamily: 'JetBrains Mono' }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className={styles.formGroup}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <label className={styles.label}>Thumbnail URL (Icon)</label>
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleUseClanBadge}
                                                                        style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            color: '#60a5fa',
                                                                            fontSize: '0.68rem',
                                                                            cursor: 'pointer',
                                                                            padding: 0,
                                                                            fontFamily: 'JetBrains Mono'
                                                                        }}
                                                                    >
                                                                        Use Clan Badge
                                                                    </button>
                                                                </div>
                                                                <input
                                                                    type="url"
                                                                    className={styles.input}
                                                                    value={formData.thumbnail}
                                                                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                                                    placeholder="https://.../badge.png"
                                                                />
                                                            </div>

                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Banner Image URL (Optional)</label>
                                                                <input
                                                                    type="url"
                                                                    className={styles.input}
                                                                    value={formData.image}
                                                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                                    placeholder="https://.../banner.png"
                                                                />
                                                            </div>

                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Footer Text</label>
                                                                <input
                                                                    type="text"
                                                                    className={styles.input}
                                                                    value={formData.footer?.text || ''}
                                                                    onChange={(e) => setFormData({
                                                                        ...formData,
                                                                        footer: { ...(formData.footer || {}), text: e.target.value }
                                                                    })}
                                                                    placeholder="Blood Alliance • Clash of Clans"
                                                                />
                                                            </div>

                                                            <div className={styles.formGroup}>
                                                                <label className={styles.label}>Footer Icon URL</label>
                                                                <input
                                                                    type="url"
                                                                    className={styles.input}
                                                                    value={formData.footer?.iconURL || ''}
                                                                    onChange={(e) => setFormData({
                                                                        ...formData,
                                                                        footer: { ...(formData.footer || {}), iconURL: e.target.value }
                                                                    })}
                                                                    placeholder="https://.../icon.png"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* RULES LIST */}
                                                        <div className={styles.ruleListSection}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                                <label className={styles.label}>
                                                                    Clan Rules ({formData.rules.length} Items)
                                                                </label>
                                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                                    Numbered sequentially in Discord
                                                                </span>
                                                            </div>

                                                            <div className={styles.ruleList}>
                                                                {formData.rules.length === 0 ? (
                                                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                                        No rules entered for this clan yet. Add your first rule below.
                                                                    </div>
                                                                ) : (
                                                                    formData.rules.map((rule, idx) => (
                                                                        <div key={idx} className={styles.ruleItemRow}>
                                                                            <span className={styles.ruleNum}>
                                                                                {String(idx + 1).padStart(2, '0')}.
                                                                            </span>
                                                                            <input
                                                                                type="text"
                                                                                value={rule}
                                                                                onChange={(e) => handleUpdateRule(idx, e.target.value)}
                                                                                className={styles.ruleInput}
                                                                                placeholder="Enter clan rule instruction..."
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDeleteRule(idx)}
                                                                                className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                                                                                title="Delete rule"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>

                                                            {/* Add Rule Form */}
                                                            <form onSubmit={handleAddRule} className={styles.addRuleRow}>
                                                                <input
                                                                    type="text"
                                                                    value={newRuleText}
                                                                    onChange={(e) => setNewRuleText(e.target.value)}
                                                                    className={styles.addRuleInput}
                                                                    placeholder="Type a new rule and press Enter or click Add..."
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    className="btn btn-secondary"
                                                                    disabled={!newRuleText.trim()}
                                                                    style={{ height: 38, padding: '0 1rem' }}
                                                                >
                                                                    <Plus size={15} style={{ marginRight: 4 }} /> Add Rule
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* RIGHT: LIVE DISCORD EMBED PREVIEW */}
                                                <div className={styles.discordContainer}>
                                                    <div className={styles.discordHeader}>
                                                        <div className={styles.discordAvatar}>BA</div>
                                                        <div>
                                                            <div className={styles.discordBotName}>
                                                                <span>Blood Alliance Bot</span>
                                                                <span className={styles.discordBotBadge}>APP</span>
                                                            </div>
                                                            <span style={{ fontSize: '0.68rem', color: '#949ba4' }}>
                                                                Live Discord Embed Preview
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={styles.discordEmbed}
                                                        style={{ borderLeftColor: formData.color || '#E74C3C' }}
                                                    >
                                                        <div className={styles.discordEmbedTop}>
                                                            <div className={styles.discordEmbedTitle}>
                                                                {resolvedTitle}
                                                            </div>
                                                            {formData.thumbnail && (
                                                                <img
                                                                    src={formData.thumbnail}
                                                                    alt="Thumbnail"
                                                                    className={styles.discordThumbnail} referrerPolicy="no-referrer"
                                                                    onError={(e) => e.target.style.display = 'none'}
                                                                />
                                                            )}
                                                        </div>

                                                        <div className={styles.discordRulesList}>
                                                            {formData.rules.length === 0 ? (
                                                                <span style={{ fontStyle: 'italic', color: '#949ba4' }}>
                                                                    No rules configured yet.
                                                                </span>
                                                            ) : (
                                                                formData.rules.map((rule, idx) => (
                                                                    <div key={idx} className={styles.discordRuleRow}>
                                                                        <span className={styles.discordRuleBullet}>
                                                                            {idx + 1}.
                                                                        </span>
                                                                        <span>{rule}</span>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>

                                                        {formData.image && (
                                                            <img
                                                                src={formData.image}
                                                                alt="Banner"
                                                                className={styles.discordBanner} referrerPolicy="no-referrer"
                                                                onError={(e) => e.target.style.display = 'none'}
                                                            />
                                                        )}

                                                        {(formData.footer?.text || formData.footer?.iconURL) && (
                                                            <div className={styles.discordFooter}>
                                                                {formData.footer?.iconURL && (
                                                                    <img
                                                                        src={formData.footer.iconURL}
                                                                        alt="Footer icon"
                                                                        className={styles.discordFooterIcon}
                                                                        onError={(e) => e.target.style.display = 'none'}
                                                                    />
                                                                )}
                                                                <span>{formData.footer?.text || 'Blood Alliance'}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* SECTION C: WAR RULES PROTOCOL & LIVE DISCORD WAR ANNOUNCEMENT PREVIEW */}
                                            <div id="clan-war-rules-section" className={styles.warRulesCard}>
                                                <div className={styles.warRulesCardHeader}>
                                                    <div className={styles.warRulesTitleGroup}>
                                                        <div className={styles.warRulesTitle}>
                                                            <Swords size={20} style={{ color: 'var(--rh-red)' }} />
                                                            War Rules Protocol & Discord Instructions
                                                        </div>
                                                        <div className={styles.warRulesSubtitle}>
                                                            Configured attack allocation, star limits, and Discord war messages for {selectedClan.name}.
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                        <button
                                                            type="button"
                                                            onClick={handleResetWarRules}
                                                            className="btn btn-secondary"
                                                            style={{ height: 34, padding: '0 0.85rem', fontSize: '0.78rem' }}
                                                            title="Reset all 4 war scenarios to alliance standard template"
                                                        >
                                                            <RotateCcw size={13} style={{ marginRight: 4 }} /> Reset Template
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleSaveWarRules}
                                                            className="btn btn-primary"
                                                            disabled={savingWar || saving}
                                                            style={{ height: 34, padding: '0 1rem', fontSize: '0.78rem' }}
                                                        >
                                                            <Save size={13} style={{ marginRight: 4 }} />
                                                            {savingWar ? 'Saving...' : 'Save War Rules'}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Scenario Tabs */}
                                                <div className={styles.warTabsContainer}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveWarTab('win')}
                                                        className={`${styles.warTabBtn} ${activeWarTab === 'win' ? styles.warTabActiveWin : ''}`}
                                                    >
                                                        <span>🟩</span> Win War (FWA Win)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveWarTab('lose')}
                                                        className={`${styles.warTabBtn} ${activeWarTab === 'lose' ? styles.warTabActiveLose : ''}`}
                                                    >
                                                        <span>🟥</span> Lose War (FWA Loss)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveWarTab('bl')}
                                                        className={`${styles.warTabBtn} ${activeWarTab === 'bl' ? styles.warTabActiveBl : ''}`}
                                                    >
                                                        <span>🛡️</span> Blacklisted War (Real Base)
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveWarTab('mis')}
                                                        className={`${styles.warTabBtn} ${activeWarTab === 'mis' ? styles.warTabActiveMis : ''}`}
                                                    >
                                                        <span>⚠️</span> Mismatch War (Non-FWA)
                                                    </button>
                                                </div>

                                                <div className={styles.warBody}>
                                                    {/* Scenario explanation banner */}
                                                    <div className={`${styles.warScenarioBanner} ${
                                                        activeWarTab === 'win' ? styles.bannerWin :
                                                        activeWarTab === 'lose' ? styles.bannerLose :
                                                        activeWarTab === 'bl' ? styles.bannerBl :
                                                        styles.bannerMis
                                                    }`}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {activeWarTab === 'win' && <span>🟩 <strong>Win War Protocol:</strong> Standard FWA win declaration — 3 stars on mirror + 1 star cleanups.</span>}
                                                            {activeWarTab === 'lose' && <span>🟥 <strong>Lose War Protocol:</strong> Standard FWA loss declaration — strictly cap hits at 2 stars per mirror.</span>}
                                                            {activeWarTab === 'bl' && <span>🛡️ <strong>Blacklisted Protocol:</strong> Against blacklisted clans — switch to full war layouts and aim for 3-star destruction.</span>}
                                                            {activeWarTab === 'mis' && <span>⚠️ <strong>Mismatch Protocol:</strong> Against non-FWA opponents — full war effort to secure the match win.</span>}
                                                        </div>

                                                        {/* Toggle Raw vs Structured Mode */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setWarRawMode(!warRawMode)}
                                                            className="btn btn-secondary"
                                                            style={{ height: 28, padding: '0 0.65rem', fontSize: '0.72rem' }}
                                                        >
                                                            {warRawMode ? (
                                                                <><Eye size={12} style={{ marginRight: 4 }} /> Structured Fields</>
                                                            ) : (
                                                                <><Code2 size={12} style={{ marginRight: 4 }} /> Edit Raw Discord Text</>
                                                            )}
                                                        </button>
                                                    </div>

                                                    <div className={styles.mainLayout}>
                                                        {/* LEFT: WAR SCENARIO EDITOR */}
                                                        <div className={styles.editorCard}>
                                                            <div className={styles.editorHeader}>
                                                                <div className={styles.editorTitle}>
                                                                    <Edit3 size={16} style={{ color: 'var(--rh-red)' }} />
                                                                    {activeWarTab.toUpperCase()} War Rule Instructions
                                                                </div>
                                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                                    Endpoint: <code>/clanrules/:tag/warules</code>
                                                                </span>
                                                            </div>

                                                            <div className={styles.editorBody}>
                                                                {/* Header & Title Fields */}
                                                                <div className={styles.configGrid}>
                                                                    <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                                                                        <label className={styles.label}>Discord Status Header Banner</label>
                                                                        <input
                                                                            type="text"
                                                                            className={styles.input}
                                                                            value={currentWarScenario.header || ''}
                                                                            onChange={(e) => handleUpdateWarScenarioField('header', e.target.value)}
                                                                            placeholder="🟩 **This war has been declared a win as per FWA rules.**"
                                                                        />
                                                                    </div>

                                                                    <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                                                                        <label className={styles.label}>Instructions Section Title</label>
                                                                        <input
                                                                            type="text"
                                                                            className={styles.input}
                                                                            value={currentWarScenario.title || ''}
                                                                            onChange={(e) => handleUpdateWarScenarioField('title', e.target.value)}
                                                                            placeholder="⚔️ **WIN WAR INSTRUCTIONS** ⚔️"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* STRUCTURED MODE */}
                                                                {!warRawMode ? (
                                                                    <>
                                                                        {/* 1. ATTACK INSTRUCTIONS */}
                                                                        <div className={styles.ruleListSection}>
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                                                                                <label className={styles.label}>
                                                                                    Attack Instructions ({currentWarScenario.instructions?.length || 0} Steps)
                                                                                </label>
                                                                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                                                                    Prefixed with Discord arrow
                                                                                </span>
                                                                            </div>

                                                                            <div className={styles.ruleList}>
                                                                                {(!currentWarScenario.instructions || currentWarScenario.instructions.length === 0) ? (
                                                                                    <div style={{ padding: '0.85rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                                                                        No specific attack instructions entered.
                                                                                    </div>
                                                                                ) : (
                                                                                    currentWarScenario.instructions.map((ins, idx) => (
                                                                                        <div key={idx} className={styles.ruleItemRow}>
                                                                                            <span className={styles.ruleNum}>
                                                                                                #{idx + 1}
                                                                                            </span>
                                                                                            <input
                                                                                                type="text"
                                                                                                value={ins}
                                                                                                onChange={(e) => handleUpdateWarInstruction(idx, e.target.value)}
                                                                                                className={styles.ruleInput}
                                                                                                placeholder="Attack instruction..."
                                                                                            />
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleDeleteWarInstruction(idx)}
                                                                                                className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                                                                                                title="Delete instruction"
                                                                                            >
                                                                                                <Trash2 size={14} />
                                                                                            </button>
                                                                                        </div>
                                                                                    ))
                                                                                )}
                                                                            </div>

                                                                            <form onSubmit={handleAddWarInstruction} className={styles.addRuleRow}>
                                                                                <input
                                                                                    type="text"
                                                                                    value={newWarInstruction}
                                                                                    onChange={(e) => setNewWarInstruction(e.target.value)}
                                                                                    className={styles.addRuleInput}
                                                                                    placeholder="Add attack instruction (e.g. 1st Attack - 3 Stars)..."
                                                                                />
                                                                                <button
                                                                                    type="submit"
                                                                                    className="btn btn-secondary"
                                                                                    disabled={!newWarInstruction.trim()}
                                                                                    style={{ height: 38, padding: '0 0.9rem' }}
                                                                                >
                                                                                    <Plus size={14} style={{ marginRight: 4 }} /> Add Step
                                                                                </button>
                                                                            </form>
                                                                        </div>

                                                                        {/* 2. IMPORTANT NOTES (for win, lose, mis) */}
                                                                        {activeWarTab !== 'bl' && (
                                                                            <div className={styles.ruleListSection}>
                                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                                                                                    <label className={styles.label}>
                                                                                        Important Notes & Requirements ({currentWarScenario.important?.length || 0} Items)
                                                                                    </label>
                                                                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                                                                        Under 📌 Important banner
                                                                                    </span>
                                                                                </div>

                                                                                <div className={styles.ruleList}>
                                                                                    {(!currentWarScenario.important || currentWarScenario.important.length === 0) ? (
                                                                                        <div style={{ padding: '0.85rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                                                                            No important notes configured.
                                                                                        </div>
                                                                                    ) : (
                                                                                        currentWarScenario.important.map((imp, idx) => (
                                                                                            <div key={idx} className={styles.ruleItemRow}>
                                                                                                <span style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, minWidth: 24 }}>
                                                                                                    📌
                                                                                                </span>
                                                                                                <input
                                                                                                    type="text"
                                                                                                    value={imp}
                                                                                                    onChange={(e) => handleUpdateWarImportant(idx, e.target.value)}
                                                                                                    className={styles.ruleInput}
                                                                                                    placeholder="Important note..."
                                                                                                />
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => handleDeleteWarImportant(idx)}
                                                                                                    className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                                                                                                    title="Delete note"
                                                                                                >
                                                                                                    <Trash2 size={14} />
                                                                                                </button>
                                                                                            </div>
                                                                                        ))
                                                                                    )}
                                                                                </div>

                                                                                <form onSubmit={handleAddWarImportant} className={styles.addRuleRow}>
                                                                                    <input
                                                                                        type="text"
                                                                                        value={newWarImportant}
                                                                                        onChange={(e) => setNewWarImportant(e.target.value)}
                                                                                        className={styles.addRuleInput}
                                                                                        placeholder="Add important note (e.g. Use both attacks)..."
                                                                                    />
                                                                                    <button
                                                                                        type="submit"
                                                                                        className="btn btn-secondary"
                                                                                        disabled={!newWarImportant.trim()}
                                                                                        style={{ height: 38, padding: '0 0.9rem' }}
                                                                                    >
                                                                                        <Plus size={14} style={{ marginRight: 4 }} /> Add Note
                                                                                    </button>
                                                                                </form>
                                                                            </div>
                                                                        )}

                                                                        {/* 3. BLACKLISTED WAR SPECIFIC: GOALS & NOTES */}
                                                                        {activeWarTab === 'bl' && (
                                                                            <>
                                                                                {/* War Goals */}
                                                                                <div className={styles.ruleListSection}>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                                                                                        <label className={styles.label}>
                                                                                            War Goals ({currentWarScenario.goals?.length || 0} Items)
                                                                                        </label>
                                                                                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                                                                            Under 📌 War Goals
                                                                                        </span>
                                                                                    </div>

                                                                                    <div className={styles.ruleList}>
                                                                                        {(!currentWarScenario.goals || currentWarScenario.goals.length === 0) ? (
                                                                                            <div style={{ padding: '0.85rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                                                                                No war goals configured.
                                                                                            </div>
                                                                                        ) : (
                                                                                            currentWarScenario.goals.map((g, idx) => (
                                                                                                <div key={idx} className={styles.ruleItemRow}>
                                                                                                    <span style={{ color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700, minWidth: 24 }}>
                                                                                                        🎯
                                                                                                    </span>
                                                                                                    <input
                                                                                                        type="text"
                                                                                                        value={g}
                                                                                                        onChange={(e) => handleUpdateWarGoal(idx, e.target.value)}
                                                                                                        className={styles.ruleInput}
                                                                                                        placeholder="War goal..."
                                                                                                    />
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => handleDeleteWarGoal(idx)}
                                                                                                        className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                                                                                                        title="Delete goal"
                                                                                                    >
                                                                                                        <Trash2 size={14} />
                                                                                                    </button>
                                                                                                </div>
                                                                                            ))
                                                                                        )}
                                                                                    </div>

                                                                                    <form onSubmit={handleAddWarGoal} className={styles.addRuleRow}>
                                                                                        <input
                                                                                            type="text"
                                                                                            value={newWarGoal}
                                                                                            onChange={(e) => setNewWarGoal(e.target.value)}
                                                                                            className={styles.addRuleInput}
                                                                                            placeholder="Add war goal (e.g. 60% destruction)..."
                                                                                        />
                                                                                        <button
                                                                                            type="submit"
                                                                                            className="btn btn-secondary"
                                                                                            disabled={!newWarGoal.trim()}
                                                                                            style={{ height: 38, padding: '0 0.9rem' }}
                                                                                        >
                                                                                            <Plus size={14} style={{ marginRight: 4 }} /> Add Goal
                                                                                        </button>
                                                                                    </form>
                                                                                </div>

                                                                                {/* Layout Notes & Base Links */}
                                                                                <div className={styles.ruleListSection}>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                                                                                        <label className={styles.label}>
                                                                                            Base Links & Post-War Instructions ({currentWarScenario.notes?.length || 0} Items)
                                                                                        </label>
                                                                                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                                                                            Layout link & post-war reset notice
                                                                                        </span>
                                                                                    </div>

                                                                                    <div className={styles.ruleList}>
                                                                                        {(!currentWarScenario.notes || currentWarScenario.notes.length === 0) ? (
                                                                                            <div style={{ padding: '0.85rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                                                                                No layout links or notes configured.
                                                                                            </div>
                                                                                        ) : (
                                                                                            currentWarScenario.notes.map((n, idx) => (
                                                                                                <div key={idx} className={styles.ruleItemRow}>
                                                                                                    <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, minWidth: 24 }}>
                                                                                                        {idx === 0 ? '📚' : '🔁'}
                                                                                                    </span>
                                                                                                    <input
                                                                                                        type="text"
                                                                                                        value={n}
                                                                                                        onChange={(e) => handleUpdateWarNote(idx, e.target.value)}
                                                                                                        className={styles.ruleInput}
                                                                                                        placeholder="Base link or post war note..."
                                                                                                    />
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        onClick={() => handleDeleteWarNote(idx)}
                                                                                                        className={`${styles.iconBtn} ${styles.deleteIconBtn}`}
                                                                                                        title="Delete note"
                                                                                                    >
                                                                                                        <Trash2 size={14} />
                                                                                                    </button>
                                                                                                </div>
                                                                                            ))
                                                                                        )}
                                                                                    </div>

                                                                                    <form onSubmit={handleAddWarNote} className={styles.addRuleRow}>
                                                                                        <input
                                                                                            type="text"
                                                                                            value={newWarNote}
                                                                                            onChange={(e) => setNewWarNote(e.target.value)}
                                                                                            className={styles.addRuleInput}
                                                                                            placeholder="Add note or link..."
                                                                                        />
                                                                                        <button
                                                                                            type="submit"
                                                                                            className="btn btn-secondary"
                                                                                            disabled={!newWarNote.trim()}
                                                                                            style={{ height: 38, padding: '0 0.9rem' }}
                                                                                        >
                                                                                            <Plus size={14} style={{ marginRight: 4 }} /> Add Note
                                                                                        </button>
                                                                                    </form>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    /* RAW DISCORD TEXT MODE */
                                                                    <div className={styles.ruleListSection}>
                                                                        <div className={styles.rawTextToolbar}>
                                                                            <label className={styles.label}>
                                                                                Raw Discord Message Text ({activeWarTab.toUpperCase()})
                                                                            </label>
                                                                            <button
                                                                                type="button"
                                                                                onClick={handleResyncFromFields}
                                                                                className="btn btn-secondary"
                                                                                style={{ height: 28, padding: '0 0.65rem', fontSize: '0.72rem' }}
                                                                            >
                                                                                <RotateCcw size={12} style={{ marginRight: 4 }} /> Re-sync from Fields
                                                                            </button>
                                                                        </div>

                                                                        <textarea
                                                                            className={styles.warRawTextarea}
                                                                            value={currentWarScenario.text || ''}
                                                                            onChange={(e) => handleUpdateRawText(e.target.value)}
                                                                            placeholder="Enter Discord formatted war announcement text..."
                                                                        />

                                                                        <div className={styles.rawTextSyntaxHelp}>
                                                                            <span>Syntax tokens:</span>
                                                                            <span className={styles.rawTextSyntaxTag}><code>{'{rarrow}'}</code> = Arrow bullet</span>
                                                                            <span className={styles.rawTextSyntaxTag}><code>{'{cocfight}'}</code> = Swords icon</span>
                                                                            <span className={styles.rawTextSyntaxTag}><code>**bold**</code> = Bold text</span>
                                                                            <span className={styles.rawTextSyntaxTag}><code>━━━━━━━━</code> = Divider line</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* RIGHT: LIVE DISCORD WAR MESSAGE PREVIEW */}
                                                        <div className={styles.discordWarMessageCard}>
                                                            <div className={styles.discordHeader}>
                                                                <div className={styles.discordAvatar}>BA</div>
                                                                <div>
                                                                    <div className={styles.discordBotName}>
                                                                        <span>Blood Alliance Bot</span>
                                                                        <span className={styles.discordBotBadge}>APP</span>
                                                                    </div>
                                                                    <span style={{ fontSize: '0.68rem', color: '#949ba4' }}>
                                                                        Discord War Announcement • {activeWarTab.toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className={`${styles.discordWarContent} ${
                                                                activeWarTab === 'win' ? styles.discordWarBorderWin :
                                                                activeWarTab === 'lose' ? styles.discordWarBorderLose :
                                                                activeWarTab === 'bl' ? styles.discordWarBorderBl :
                                                                styles.discordWarBorderMis
                                                            }`}>
                                                                {renderFormattedDiscordContent(currentWarScenario.text || generateWarText(activeWarTab, currentWarScenario), activeWarTab)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* MODAL FOOTER */}
                                    <div className={styles.modalFooter}>
                                        <div className={styles.modalFooterInner}>
                                            <div className={styles.modalFooterText}>
                                                <span>Discord Embed & War Rules Protocol Editor</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={handleCloseModal}
                                                    className="btn btn-secondary"
                                                    style={{ height: 38, padding: '0 1.25rem' }}
                                                >
                                                    Close
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSave}
                                                    className="btn btn-primary"
                                                    disabled={saving || savingWar}
                                                    style={{ height: 38, padding: '0 1.5rem' }}
                                                >
                                                    <Save size={16} style={{ marginRight: 6 }} />
                                                    {saving ? 'Saving...' : 'Save Clan & War Rules'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </div>
        </div>
    );
};

export default ClanRulesManagement;