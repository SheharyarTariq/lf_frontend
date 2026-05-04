# Project Context: LF-Frontend

Framework: Next.js (App Router, v16.1.6)
Language: TypeScript, React 19
Styling: Tailwind CSS v4, MUI, Lucide React
Data Fetching / API: Axios based custom utils (`src/utils/api-call` & `src/utils/api-request`)

## 🚨 GLOBAL AI AGENT RULES 🚨

The following rules MUST be obeyed under all circumstances when modifying or reading this codebase.

### 1. Code Writing & Comments (STRICT)

- **NO COMMENTS IN CODE:** Do NOT write any comments in the code unless explicitly asked to do so by the user. Not a single comment should be added.
- **NO UNNECESSARY BUILDS:** Do NOT run `npm run build` or any build-related commands with every prompt. Only run them where specifically asked or if it is an absolute necessity.

### 2. Styling (STRICT)

- **NO `!important`:** Do NOT use `!important` in CSS or Tailwind classes.
- **USE TAILWIND-MERGE:** Resolve class conflicts using the `cn` utility (which leverages `clsx` and `tailwind-merge`) located at `src/utils/cn.ts`.
- **GLOBAL COLORS & FONTS:** Always store and retrieve colors, fonts, and theme variables in `src/app/globals.css`. Do not hardcode hex colors throughout the app. Define them in `globals.css` using Tailwind v4 `@theme inline` variables, and then use the corresponding Tailwind utility classes.

### 3. Routes & Navigation

- **USE ROUTES CONFIG:** All UI and API routes are strictly defined and stored in `src/utils/routes/index.tsx`.
- **NO HARDCODING ROUTES:** ALWAYS import and use the routes from this file. If a new Page Route or API endpoint is added, update the `src/utils/routes/index.tsx` file first.

### 4. Components & Reusability

- **USE EXISTING COMPONENTS:** Common UI components (buttons, tables, inputs, forms, dialogs, selects, cards, etc.) are already built in the project.
- **COMMON FOLDER:** Always look in `src/components/common/` before creating a new component. Utilize these generic elements (e.g., `Button`, `Input`, `GenericTable`, `form-dailog`, `Select`).
- **USE EXISTING API UTILS:** Look in `src/utils/api-call/` and `src/utils/api-request/` for handling API interactions.

### 5. Folder Structure

- **MAINTAIN STRUCTURE:** Use the same folder and naming structure as the existing code. Group files logically: UI features in `src/components/<feature-name>/`, generic UI in `src/components/common/`, and helper functions in `src/utils/`.
- **COMPONENT MODULARIZATION:** When a component grows too large or complex, break it down within its own containing folder. Extract interfaces into `types.ts`, static mappings/values into `constants.ts`, encapsulate business logic into custom hooks (e.g., `useComponentName.ts`), and split sub-rendering logic into separate UI component files.

### 6. Updating this File

- **CONTINUOUS LEARNING & NEW RULES:** Whenever you (the AI Agent) are given a new rule by the USER, you MUST automatically append it to both `AGENT_RULES.md` and `.cursorrules`. Additionally, whenever you make a significant structural change, add a new common component, or define a new global pattern, update these files. This ensures future prompts have the latest context, saves tokens, and eliminates the need to recursively search for foundational files every time.
