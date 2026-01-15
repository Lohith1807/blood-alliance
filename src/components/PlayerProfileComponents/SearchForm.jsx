import React from 'react';
import { Search } from 'lucide-react';
import styles from '../../css/PlayerProfile.module.css';

const SearchForm = ({ searchTerm, setSearchTerm, handleSearch }) => (
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
            <div className={styles.systemStatus}>System Ready • v2.4.0</div>
        </div>
    </div>
);

export default SearchForm;
