import { Search, RefreshCw } from 'lucide-react';
import styles from '../../css/PlayerProfile.module.css';

const SearchForm = ({ searchTerm, setSearchTerm, handleSearch, onRefresh, refreshing }) => (
    <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
            <h1 className={styles.title}>
                PLAYER <span className={styles.highlight}>LOOKUP</span>
            </h1>
            <form onSubmit={handleSearch} className={styles.form}>
                <Search className={styles.inputIcon} size={20} />
                <input
                    type="text"
                    placeholder="ENTER PLAYER TAG"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                    className={styles.input}
                />
                <button type="submit" className={styles.searchBtn}>Analyze</button>
            </form>
            <div className={styles.systemStatus}>
                <span className={styles.statusText}>System Ready • v2.4.0</span>
                <button
                    onClick={onRefresh}
                    className={styles.refreshBtn}
                    title="Refresh Backend Connection"
                    disabled={refreshing}
                >
                    <RefreshCw size={14} className={refreshing ? styles.spin : ''} />
                    {refreshing ? ' Updating...' : ' Refresh Link'}
                </button>
            </div>
        </div>
    </div>
);

export default SearchForm;
