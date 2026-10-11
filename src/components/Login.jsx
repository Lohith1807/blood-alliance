import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from '@/css/Login.module.css';

const Login = () => {
    const { login, isAuthenticated, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If already authenticated, redirect to the landing page immediately
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        clearSessionExpiredMessage();

        if (!email.trim() || !password) {
            setError('Please enter both email address and password');
            return;
        }

        setLoading(true);
        try {
            await login(email.trim(), password);
            // After successful authentication, redirect user to the existing landing page
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <motion.div
                className={styles.loginCard}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
            >
                <div className={styles.cardHeader}>
                    <div className={styles.brandBadge}>
                        <Lock size={12} />
                        <span>Security Gateway</span>
                    </div>
                    <h1 className={styles.title}>Account Login</h1>
                    <p className={styles.subtitle}>
                        Sign in with your email and password to access alliance modules
                    </p>
                </div>

                {/* Session Expired Notice */}
                {sessionExpiredMessage && (
                    <motion.div
                        className={`${styles.alertBox} ${styles.warningAlert}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                        <span>{sessionExpiredMessage}</span>
                    </motion.div>
                )}

                {/* Error Notice */}
                {error && (
                    <motion.div
                        className={`${styles.alertBox} ${styles.errorAlert}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <AlertCircle size={18} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="login-email">
                            Email Address
                        </label>
                        <div className={styles.inputWrapper}>
                            <Mail size={16} className={styles.inputIcon} />
                            <input
                                id="login-email"
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="name@bloodalliance.com"
                                className={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="login-password">
                            Password
                        </label>
                        <div className={styles.inputWrapper}>
                            <Lock size={16} className={styles.inputIcon} />
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                placeholder="••••••••••••"
                                className={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.submitBtn}`}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : (
                            <>
                                Sign In <ArrowRight size={16} style={{ marginLeft: 6 }} />
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.cardFooter}>
                    <span>Authenticated sessions are securely retained for up to 7 days.</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
