# Changelog

All notable changes to this project will be documented in this file.

## [2026-02-24]

### Added

- **Premium Tree View Overhaul**: Successfully implemented a high-end visualization system for the family tree.
  - **Glassmorphism Nodes**: Person cards with `backdrop-blur`, semi-transparent backgrounds, and depth-based shadows.
  - **Gender-Based Luminous Glow**:
    - Male members: Blue ambient glow.
    - Female members: Rose/Pink ambient glow.
  - **Premium Stats Overlay**: A sleek, glass-styled indicator for tree statistics (zoom level, membership counts).
  - **Advanced Selection Aura**: High-intensity luminous ring for selected/focused members.
  - **Context Menu & Editor Upgrade**: Translucent glass-themed interfaces for tree interaction.
- **Dark Mode Optimization**: Comprehensive color token audit to ensure perfect visibility and premium aesthetics in dark theme.
- **Premium Landing Page**: Implemented an immersive homepage with 3D typography, ambient orbs, and animated live-stats.
- **3D Electronic Book (Flipbook)**: Integrated `react-pageflip` with high-fidelity 3D page animations, premium paper textures, and realistic spine shadows.

### Changed

- **Node Layout Optimization**:
  - Increased base card width from 180px to 200px.
  - Reduced font sizes and optimized padding to support full Vietnamese name display without truncation.
- **Code Quality**:
  - Eliminated complex cascading render warnings in `tree-client.tsx` using conditional state sync.
  - Strict typing for search and layout computed properties.
- **Family Branding Migration**: Globally updated the genealogy brand and metadata from "Lê Huy" to "Đỗ Quý" across all UI components and SEO configs.

## [2026-02-23]

### Added

- **Premium UI for Member Profile**: Implemented a complete overhaul of the person profile page (`/people/[handle]`) based on the FinMate Style Kit.
  - Glassmorphism effects for cards and background elements.
  - Dynamic gender-based gradients in the profile header.
  - Animated background glow mesh and ambient orbs.
  - Enhanced Tab navigation for structured information display.
- **Project Roadmap & Strategy**:
  - Created a comprehensive `ROADMAP.md` (v2.1) including Mermaid screen-flow diagrams, detailed User Journeys, and a 4-phase implementation plan.
- **Extended Profile Data Support**:
  - Added support for `nickName`, `zalo`, `facebook`, `company`, and `_privacyNote` in frontend data structures.
  - Updated mapping layer in `supabase-data.ts` to fetch these fields.

### Changed

- **Type Definitions**: Updated `TreeNode` interface in `tree-layout.ts` to include full profile metadata.
- **Linting & Code Quality**:
  - Resolved widespread ESLint warnings (unused variables, JSX quote escaping).
  - Renamed Lucide `Image` icon to `ImageIcon` to avoid naming conflicts.

### Fixed

- Fixed data mapping issues where extended member info was being truncated between the database and the UI.
