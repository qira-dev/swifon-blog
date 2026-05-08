# QiraHub Workspace

## Overview

QiraHub is a full-stack, multilingual blog and review platform built with a pnpm monorepo using TypeScript. It specializes in AI tools, tutorials, software reviews, and comparisons. The project aims to provide comprehensive resources and insights into the rapidly evolving tech landscape, targeting a global audience through its extensive i18n support.

## User Preferences

I prefer concise and direct communication. When making changes, please prioritize core functionality and architectural integrity. For any significant alterations or new feature implementations, ask for confirmation before proceeding. I value iterative development, focusing on one feature or fix at a time. Do not make changes to files in the `lib/api-spec` directory without explicit instructions.

## System Architecture

The project is structured as a pnpm monorepo, separating the API server (`artifacts/api-server`) and the React frontend (`artifacts/qirahub`).

**Technology Stack:**
- **Monorepo:** pnpm workspaces
- **Backend:** Node.js 20, Express 5, PostgreSQL with Drizzle ORM, Zod for validation.
- **Frontend:** React, Vite, shadcn/ui, wouter for routing, Zustand for state management, TanStack Query for data fetching.
- **TypeScript:** Version 5.9, utilizing composite projects for type checking across packages.
- **API Generation:** Orval generates API client and Zod schemas from an OpenAPI specification.

**UI/UX and Theming:**
- **Admin-controlled Theme System:** No user-facing light/dark mode. The admin selects one of seven predefined themes (Cyberpunk, Midnight, Emerald, Obsidian, Crimson, Slate Pro, Parchment), which are applied site-wide. Themes are managed via CSS variables and stored in the database.
- **Visuals:** Features `bg-card` panels with neon glow effects, gradient text headings, and a category-specific neon accent color system.
- **Avatar System:** Includes 30 unique, inline-SVG avatar characters, categorized by archetypes and neon color themes, eliminating external image dependencies.
- **Internationalization (i18n):** Supports 12 languages (EN, ES, HI, AR, FR, BN, DE, PT, KO, RU, ZH, JA) with full i18n coverage for dynamic content (posts, categories, products, comparisons) and all public-facing UI strings. Arabic support includes `dir="rtl"`. Translation system: (1) static UI strings via `t()` hook from `i18n.ts`; (2) dynamic content translations via DB `translations` table fetched with `?lang=X` on all API endpoints. Admin `/admin/translations` page with per-item manual and auto-translate (Google Translate) for all 11 non-English languages. Fixed (2025-01): Stats API endpoints (`featured-posts`, `recent-posts`, `posts-per-category`) were missing `lang` param in the OpenAPI spec, causing generated client hooks to silently drop `lang` — updated spec + regenerated client.

**Core Features & Functionality:**
- **Ad Management System:** Full admin-controlled ad system with `ads` DB table. Supports types: banner (image), AdSense/Rio (script code), custom HTML, text link, corner video. Positions: header_top, sidebar, footer_top, inline, between_posts, corner. Configured per page (all/home/blog/category/reviews/comparisons/contact/profile). Frontend `AdSlot` component auto-fetches and renders matching ads. Integrated into Layout (global slots), Home, Blog, Reviews pages.
- **Coupon Code Management System:** Full-featured coupon system with `coupons` and `coupon_ads` DB tables. Public `/coupons` page with category filter tabs (VPN, Hosting, Software, Antivirus, Password Manager, Cloud Storage, Design Tools, VoIP, Other), coupon cards (logo, discount badge, type, expiry, verified badge, "Reveal Code" button). Reveal modal: shows ad first (coupon-specific or global fallback), then blurred code → click to copy. Admin `/admin/coupons` with 2 tabs: Coupons CRUD (title, code, category, type, discount, description, terms, logo, website, affiliate, expiry, active, verified, sort order) and Coupon Ads CRUD (name, type, coupon assignment, image/code/redirect, active). Coupon link added to footer Quick Links and admin sidebar.
- **Content Management:** CRUD operations for posts, categories, tags, products, and comparisons. Posts support various statuses (draft/published/archived) and positions (featured/pinned/series).
- **User Authentication:** Registration and login with JWT-based authentication. Admin roles are managed via an `isAdmin` flag or a development admin key (`qirahub-admin-dev-key`).
- **Moderator Role System:** Registered users with `role = "moderator"` in the DB can log into the admin panel. Moderators can create/edit posts, categories, products, and comparisons but cannot delete any content. Delete buttons are hidden in the UI via `canDelete()` from `admin-auth.ts`, and DELETE API endpoints still require the admin key for backend enforcement. Moderators only see the "Content" section in the admin sidebar (Posts, Categories, Products, Comparisons). The admin sidebar shows a role badge (Admin/Moderator) and a "Go to Website" external link. Auth uses `getAuthHeaders()` which sends `Authorization: Bearer <token>` for JWT users and `x-admin-key` for key-based admins. SessionStorage keys: `qirahub_admin_authed`, `qirahub_user_role`, `qirahub_user_token`.
- **Blog Post Reviews & Ratings:** Users can star-rate (1–5) and comment on individual blog posts. Review section appears at the bottom of each post page, below the newsletter CTA. Features: interactive star picker, rating summary bar with per-star breakdown, review cards (avatar, name, stars, date, comment), "You" badge on own review, edit/delete own review. Unauthenticated users see a "Sign in to leave a review" prompt. Backend: `post_reviews` DB table (postId, userId, rating, comment). API routes: `GET /api/posts/:postId/reviews` (public, returns reviews+stats), `POST /api/posts/:postId/reviews` (JWT auth, upserts review), `DELETE /api/posts/:postId/reviews/:reviewId` (JWT auth, own or admin). Related Posts (same category, excluding current) and Recent Posts (latest published) sections appear below the reviews section in a 2-column grid.
- **Product and Comparison Reviews:** Dedicated sections for product reviews with ratings, pros/cons, features, and side-by-side comparison tables.
- **Public Comparisons Page (`/comparisons`):** Lists all admin-created comparisons grouped by category with filter tabs. Links to individual comparison detail pages (`/compare/:slug`).
- **Interactive Compare Tool (`/compare-tool`):** Users select a category, pick 2–4 products, and instantly see a real-time side-by-side comparison table (rating, pricing, features, pros, cons). Client-side filtering — only shows categories that have at least one product.
- **Demo Section Management (`/admin/demo-sections`):** Page still exists (accessible by direct URL) but removed from the sidebar nav. Controls visibility of three homepage demo sections via site_settings keys `demo_blog_enabled`, `demo_reviews_enabled`, `demo_comparisons_enabled`.
- **Homepage Demo Sections:** Three conditionally-shown sections on the home page: featured posts (blog), top-rated products (reviews), and featured comparisons. Each reads its visibility from site_settings and defaults to visible.
- **Site Settings:** Admin panel for managing site-wide settings (privacy policy, terms of service, about page content, social links).
- **Contact Management:** Public contact form with an admin inbox for message management (reply, status updates).
- **Dashboard & Analytics:** Admin dashboard provides summary statistics (7 KPI cards: Posts, Published, Drafts, Categories, Tags, Products, Users), post counts by category, and recent/featured posts.
- **Analytics Page (`/admin/analytics`):** Comprehensive analytics section in the admin sidebar (Content section). Shows 8 KPI cards (site-wide totals), Content Trends area chart (posts per month, last 12 months), Posts by Status/Position donut charts, Top Categories bar chart, Users by Role chart, Product rating distribution, Advertising (ads by network + status), Coupons breakdown, and Messages status pie chart. Powered by the `/api/stats/analytics-overview` endpoint using recharts for all visualizations.

**Database Schema Highlights:**
- `posts`: Blog posts with extensive metadata and SEO fields.
- `categories`: Hierarchical categories with visibility and icon/color options.
- `users`: User accounts with roles and authentication details.
- `products`: Detailed product review information.
- `comparisons`: Data for side-by-side product comparisons.
- `post_reviews`: User reviews/ratings for blog posts (postId, userId, rating 1-5, comment).
- `translations`: Generic table for multilingual content across various entities.
- `site_settings`: Key-value store for global configurations.

**Security Architecture:**
- **Helmet.js** adds HTTP security headers to every response: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `X-Permitted-Cross-Domain-Policies: none`, and more.
- **CORS:** Open in development; in production, restricted to origins listed in `ALLOWED_ORIGINS` environment variable (comma-separated). Set `ALLOWED_ORIGINS` secret in production to your live domain.
- **Rate limiting (express-rate-limit):** Applied to all auth endpoints (login, register, forgot-password, reset-password, admin-key-login) — 20 requests per 15 minutes per IP in production. Disabled in development.
- **Request body size:** Hard-capped at 2 MB for both JSON and URL-encoded bodies.
- **Password hashing:** bcrypt with 10 salt rounds throughout.
- **Minimum password length:** 8 characters (enforced at both API and frontend levels).
- **Password reset flow:** When SMTP is configured → token is emailed, never returned in the API response. In development without SMTP → token returned directly (for usability). In production without SMTP → generic message only, token is never exposed.
- **XSS protection:** All `dangerouslySetInnerHTML` usages pass through `DOMPurify.sanitize()` — applies to blog posts, about page, privacy page, terms page. `AdSlot.tsx` deliberately uses raw `innerHTML` for ad scripts (admin-controlled only).
- **RBAC (3-tier):** Super Admin (raw key, role=key_admin) > Admin (role=admin, JWT) > Moderator (role=moderator, JWT). Least-privilege guards on all API routes. Audit log records every admin write action.
- **Audit log:** `audit_logs` DB table. All admin create/update/delete actions are logged with actor role, email, IP, user-agent, resource type/ID, and details. Viewable only by Super Admin at `/admin/audit-log`.
- **Seed script:** `SEED_ADMIN_PASSWORD` env var required (no hardcoded passwords). Never logs credentials to console.
- **Session storage:** Admin tokens in `sessionStorage` (cleared on tab/browser close). User tokens in `localStorage`.
- **Super admin email** (`qirahub@gmail.com`) is defined once in `middleware/auth.ts` as `SUPER_ADMIN_EMAIL` and imported everywhere — no duplication.

## External Dependencies

- **PostgreSQL:** Primary database, managed via Drizzle ORM.
- **Vite:** Frontend build tool and development server.
- **shadcn/ui:** UI component library for React.
- **Zustand:** Frontend state management library.
- **TanStack Query:** Data fetching and caching library for React.
- **Orval:** API client and schema generation tool based on OpenAPI.
- **bcrypt:** For hashing user passwords.