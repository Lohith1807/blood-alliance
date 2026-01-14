# Blood Alliance Ana: Design System & Developer Guide

This document serves as the "Source of Truth" for the **Blood Alliance Ana** platform. Use this as a reference for creating new pages, components, and maintaining the enterprise-tech (Red Hat/Ansible) aesthetic.

---

## 1. Core Principles (The Rules)

- **High Density (MAANG Style)**: Information should be compact. Avoid large white spaces. Small font sizes (12px-14px) are preferred for utility.
- **Enterprise-Tech Aesthetic**: Use sharp corners (2px radius), flat borders, and technical accents (monospaced text, code-like taglines).
- **Accessibility & Feasibility**: Ensure high contrast ratios. Use semantic HTML and functional React hooks for efficiency.
- **Consistency**: All sections must follow the 1200px container width and 56px navbar height.

---

## 2. Visual Theme (The Specs)

### Colors (CSS Variables)
| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `--rh-red` | `#EE0000` | Primary action, accent, and brand branding. |
| `--bg-primary` | `#151515` | Main page background. |
| `--bg-secondary`| `#212121` | Card and section backgrounds. |
| `--border-color` | `#3C3F42` | Divider lines and card borders. |
| `--text-primary` | `#FFFFFF` | Primary headers and high-importance text. |
| `--text-muted` | `#8A8D90` | Low-importance metadata and labels. |

### Typography
- **Primary Font**: `Inter` (Sans-serif) - Used for all UI elements.
- **Technical Font**: `JetBrains Mono` (Monospace) - Used for tags, IDs, and stats.
- **Scales**:
  - `H1`: 2.5rem (40px)
  - `H2`: 1.25rem (20px)
  - `Body`: 0.8125rem (13px)
  - `Metadata`: 0.75rem (12px)
  - `Labels`: 0.7rem (11.2px)

---

## 3. UI Patterns (Reusable Components)

### Navbar Protocol
- **Height**: `56px`
- **Logo**: `BLOOD ALLIANCE ANA` (Inter Bold, Red/White split).
- **Hover State**: Border-bottom (2px) in Red Hat Red.

### Data Grid/Table
- Use `display: flex` with consistent flex-basis for "pseudo-table" rows.
- **Header**: High contrast, uppercase labels, `0.7rem` font size.
- **Rows**: `0.75rem - 0.9rem` text, `1px` border-bottom.

### Information Cards
- **Padding**: `1.25rem`.
- **Radius**: `2px` (Enterprise sharp).
- **Stat Item**: Compact box with small labels above values.

---

## 4. Architecture Memory

### Data Management
- **Static Assets**: Stored in `src/data/*.json`.
- **Protocol**: Always include `playerTag` or `clanTag` as unique keys for React rendering.

### State Management
- **Tab Switching**: Handled in `App.jsx` via `useState('home' | 'players')`.
- **Filtering**: Use `useMemo` for high-performance searches on large datasets.

### Scaling the App
1. **Adding a Page**: 
   - Create the component in `src/components/NewPage.jsx`.
   - Add a new tab state in `App.jsx`.
   - Update the `Navbar.jsx` with a new nav item.
2. **Adding Data**:
   - Update the respective JSON file in `src/data/`.
   - The UI will automatically synchronize (memoized hooks).

---

## 5. Deployment & Git
- **Repository**: `https://github.com/Lohith1807/blood-alliance-site`
- **Branch Strategy**: Direct to `main` for individual updates.
- **Build**: `npm run build` generates the production-optimized dist folder.

---
*Reference document protocol v1.0 | Blood Alliance Ana*
