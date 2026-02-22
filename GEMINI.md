# GEMINI.md - Project Context for Gemini AI

## Project Overview
**Name:** lf-frontend (Laundry-Free Admin Panel)  
**Framework:** Next.js 16.1.6 (App Router, Turbopack)  
**Language:** TypeScript 5  
**UI:** React 19.2.3, Tailwind CSS 4 (via @tailwindcss/postcss)  
**Font:** Poppins (all weights, via next/font/google, CSS var: `--font-poppins`)  
**API Client:** Axios  
**Notifications:** react-hot-toast (position: bottom-center)  
**Icons:** lucide-react  
**Path Alias:** `@/*` → `./src/*`  
**Backend API:** Heroku staging (`https://lf-server-staging-2ecbf989678b.herokuapp.com/`)  
**Node env var:** `NEXT_PUBLIC_API_URL`

## IMPORTANT RULES
- **NEVER write comments in code** — not a single comment unless specifically asked
- **NEVER run `npm run build`** or any build commands unless specifically asked
- Next.js 16 uses `proxy.ts` (not `middleware.ts`) with `export function proxy` for route protection
- The `config.ts` in project root is for server-side API URL; `.env` has the public one

## Project Structure
```
lf-frontend/
├── .env                          # NEXT_PUBLIC_API_URL
├── config.ts                     # Server-side API URL config (apiUrl)
├── next.config.ts                # Empty/default Next.js config
├── package.json
├── tsconfig.json                 # target ES2017, bundler moduleResolution
├── postcss.config.mjs            # @tailwindcss/postcss plugin
├── eslint.config.mjs             # next core-web-vitals + typescript
├── public/                       # Empty
└── src/
    ├── proxy.ts                  # Route protection (Next.js 16 proxy)
    ├── app/
    │   ├── layout.tsx            # Root layout (Poppins font, Toaster)
    │   ├── page.tsx              # Root "/" page (renders Header + Area)
    │   ├── globals.css           # Tailwind 4 + CSS custom properties
    │   ├── actions.ts            # Server action: getTokens (accessToken, refreshToken)
    │   ├── favicon.ico
    │   ├── auth/
    │   │   └── sign-in/
    │   │       └── page.tsx      # Sign-in page (renders SignIn component)
    │   └── (Dashboard)/
    │       ├── layout.tsx        # Dashboard layout (renders Header + children)
    │       ├── area/
    │       │   └── page.tsx      # /area page (renders Area component)
    │       └── category/
    │           └── page.tsx      # /category page (renders Category component)
    └── components/
        ├── auth/
        │   └── sign-in/
        │       └── index.tsx     # SignIn form (client component, handles login API + cookie)
        ├── area/
        │   ├── index.tsx         # Area page component (search + create + table)
        │   └── area-table/
        │       └── index.tsx     # AreaTable (GenericTable with static mock data)
        ├── category/
        │   └── index.tsx         # Category page component (search + create)
        ├── layout/
        │   └── header/
        │       └── index.tsx     # Header nav (client component, route-based active states)
        └── common/
            ├── Button/
            │   └── index.tsx     # Button component (variants: primary/secondary/outline)
            ├── Input/
            │   └── index.tsx     # Input component (optional search icon, startIcon prop)
            ├── GenericTable/
            │   └── index.tsx     # Generic typed table (Column<T>, data<T>)
            ├── form-dailog/
            │   └── index.tsx     # FormDialog modal (trigger button + modal with form)
            └── utils/
                ├── api-call/
                │   └── index.ts  # Client-side API wrapper (axios + toast error handling)
                ├── api-request/
                │   └── index.ts  # Server-side API wrapper (fetch + cookies auth)
                └── routes/
                    └── index.tsx # Centralized route & API endpoint constants
```

## Design System (globals.css)
| CSS Variable     | Value      | Tailwind Token    |
|-----------------|------------|-------------------|
| --background    | #ffffff    | `bg-background`   |
| --foreground    | #171717    | `text-foreground`  |
| --delete        | #D62626    | `text-delete`      |
| --secondary     | #C1F11D    | `bg-secondary`     |
| --muted         | #EAEAEA    | `bg-muted`, `border-muted` |
| --neutral       | #8F8F8F    | `text-neutral`     |
| --placeholder   | #C1C1C1    | (CSS var only)     |
| --limeGreen     | #D6FF4B    | `bg-limeGreen`     |

Dark mode is overridden to keep white background.

## Routing & Authentication

### Route Protection (src/proxy.ts)
- Uses Next.js 16 `proxy.ts` convention (NOT middleware.ts)
- Exports `proxy` function and `config` with matcher
- **Protected routes:** `/`, `/area`, `/category`, `/orders`, `/users`
- **Auth routes:** `/auth/sign-in`
- **Cookie name:** `authtoken` (read via `req.cookies.get("authtoken")?.value`)
- Logic: No token + protected route → redirect to `/auth/sign-in`
- Logic: Has token + auth route → redirect to `/area`

### Route Constants (components/common/utils/routes)
```typescript
routes.ui.indexRoute = "/"
routes.ui.signIn = "/auth/sign-in"
routes.ui.areas = "/area"
routes.ui.category = "/category"
routes.ui.orders = "/orders"
routes.ui.users = "/users"

routes.api.getArea = "areas"
routes.api.login = "login-check"
```

### App Route Groups
- `(Dashboard)` — route group with shared Header layout for `/area` and `/category`
- Root `/` page also renders Header + Area (duplicate of `/area`)
- `/auth/sign-in` — standalone sign-in page (no Header)

## Key Components

### SignIn (`components/auth/sign-in/index.tsx`)
- Client component ("use client")
- Calls `apiCall<LoginResponse>({ endpoint: routes.api.login, method: "POST", data: { email, password } })`
- On success: sets `authtoken` cookie with `path=/`, pushes to `/area`
- Features: password visibility toggle (Eye/EyeOff icons)

### Header (`components/layout/header/index.tsx`)
- Client component, uses `usePathname()` and `useRouter()` for active route highlighting and navigation
- Hidden on sign-in page (`currentPage == routes.ui.signIn ? "hidden" : "bg-black"`)
- Nav buttons: Area, Category, Orders, User
- Area & Category buttons use route-based `variant` switching (secondary when active)
- Logout button clears `authtoken` cookie and redirects to sign-in page

### Button (`components/common/Button/index.tsx`)
- Variants: `primary` (black bg), `secondary` (lime green bg), `outline` (transparent)
- Extends `React.ButtonHTMLAttributes<HTMLButtonElement>`

### Input (`components/common/Input/index.tsx`)
- Props: `search` (boolean, adds Search icon), `startIcon` (custom icon)
- Extends `React.InputHTMLAttributes<HTMLInputElement>`

### GenericTable (`components/common/GenericTable/index.tsx`)
- Generic typed component: `GenericTable<T>`
- Column accessor: can be `keyof T` or render function `(row: T) => ReactNode`
- Optional `onRowClick` handler

### FormDialog (`components/common/form-dailog/index.tsx`)
- Client component, reusable modal dialog with trigger button
- Props: `title`, `buttonText`, `saveButtonText`, `onSubmit`, `loading`, `children`
- `triggerVariant` prop: `"primary"` (black), `"delete"` (red/delete color), `"logout"` (white bg)
- `submitVariant` prop: `"primary"` (black), `"delete"` (red/delete color)
- Uses lucide-react X icon + Tailwind CSS modal
- Submit handler calls `onSubmit` and closes dialog on success

## API Layer

### Client-side: apiCall (`components/common/utils/api-call/index.ts`)
- Generic typed: `apiCall<T>(params) → Promise<ApiResponse<T>>`
- Uses axios with `NEXT_PUBLIC_API_URL` as base
- Auto toast.error for all HTTP error codes (400-504)
- Optional `showSuccessToast` and `successMessage`
- Handles GET params and POST/PUT/PATCH body automatically

### Server-side: apiRequest (`components/common/utils/api-request/index.ts`)
- Uses native `fetch` with `config.apiUrl` (from root config.ts)
- Optional `isProtected` flag → reads `accessToken` cookie for Bearer auth
- Calls `unauthorized()` from next/navigation on 401

### Server Action: getTokens (`app/actions.ts`)
- "use server" action
- Reads `accessToken` and `refreshToken` from cookies

## Current State & Known Issues
- Orders and Users pages don't exist yet (routes defined but no pages)
- AreaTable uses hardcoded static mock data
- Root page `/` duplicates `/area` functionality (renders Header + Area directly)
- `actions.ts` uses `accessToken`/`refreshToken` cookies while `proxy.ts` uses `authtoken` cookie (inconsistency)
- `apiRequest` uses `accessToken` cookie while `SignIn` sets `authtoken` cookie (inconsistency)
