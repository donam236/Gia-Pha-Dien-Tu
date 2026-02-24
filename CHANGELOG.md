# Changelog

All notable changes to this project will be documented in this file.

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
