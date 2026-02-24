# System Architecture: Gia Phả Điện Tử

## 🏗 High-Level Architecture

The application follows a **Modular Monolith** structure on the frontend, interacting with a **Headless Backend (BaaS)**.

### 1. Frontend Layer (Next.js 16)

- **App Router**: Handles routing and server-side logic where applicable.
- **Client Side**: Intensive use of React hooks, Zustand for state (themes/auth), and React Query for data fetching.
- **Graphics & UI**:
  - **Framer Motion**: Drives the motion-first experience.
  - **Tailwind CSS 4**: Utilized for the premium design system.
  - **shadcn/ui**: Base components heavily customized with glassmorphism styles in `globals.css`.

### 2. Data Flow

1. **Supabase Client**: Standardized interface in `lib/supabase.ts`.
2. **Data Access Layer**: `lib/supabase-data.ts` abstracts database calls and maps DB rows to application-level interfaces (`TreeNode`, etc.).
3. **Logic Layer**:
    - `lib/tree-layout.ts`: Contains the core algorithm for generating coordinate-based trees from flat relational data.
4. **Presentation Layer**: Components in `app/(main)` consume the mapped data.

### 3. Database Layer (Supabase/PostgreSQL)

- **Tables**: `people`, `families`, `profiles`, `contributions`, `comments`.
- **Security**: Row Level Security (RLS) is used to protect data based on user roles (Admin/Viewer).
- **Triggers**: Automatic profile creation upon user signup.

## 🎨 Design System: FinMate Premium

- **Glassmorphism**: Primary aesthetic consisting of `glass-card`, extreme border rounding, and backdrop filters.
- **Micro-interactions**: Hover scales, pulsating glows, and sliding transitions for active states.
- **Dynamic Themes**: Gender-aware color palettes and ambient background elements.
