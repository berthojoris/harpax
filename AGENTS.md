# AGENTS.md

## Project Context

This project is built with a modern Next.js-first architecture.

Primary stack:

- Next.js App Router
- React Server Components by default
- React Client Components only when required
- TypeScript-first development
- Server Actions for mutations and form submissions
- Route Handlers for HTTP/API boundaries
- Middleware for request-level routing, auth gates, and lightweight edge logic
- Tailwind CSS or the project-approved styling system
- Component-driven UI architecture
- Database access through the project-approved ORM/query layer
- Schema changes through project-approved migrations and database inspection tools
- Package manager must follow the existing lockfile: `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, or `bun.lockb`

Core Next.js capabilities that SHOULD be used intentionally:

- Server rendering
- Static generation
- Incremental/static revalidation when appropriate
- Streaming UI with `Suspense`
- Route segment layouts
- Nested routing
- Loading and error boundaries
- Server-side data fetching
- Cache tagging and path revalidation
- Image optimization with `next/image`
- Font optimization with `next/font`
- Script optimization with `next/script`
- Metadata API for SEO and social sharing
- Middleware for lightweight request control
- Route Handlers for explicit API endpoints
- Server Actions for trusted server mutations

---

## 1. Core Principles

- Server owns data access, secrets, authorization, validation, and business rules.
- Client owns browser-only interactivity and ephemeral UI state.
- React Server Components are the default.
- Client Components are exceptions, not the baseline.
- Business logic MUST live outside UI components.
- Type safety is mandatory across routes, actions, forms, APIs, and database access.
- Performance, accessibility, security, and maintainability are non-negotiable.

Recommended dependency direction:

```txt
UI / Routes -> Application -> Domain -> Data / Infrastructure
```

Layer responsibilities:

- UI / Routes: rendering, composition, route-specific orchestration
- Application: use cases, workflows, transaction coordination
- Domain: business rules, entities, policies, invariants
- Data / Infrastructure: ORM, database queries, external APIs, storage, queues, email

---

## 2. Non-Negotiable Rules

Agents MUST NOT:

- change the approved stack without explicit user approval
- move business rules into React components
- trust client input
- expose secrets to the browser
- bypass authorization
- bypass server-side validation
- introduce race conditions
- introduce avoidable waterfalls
- use client-side fetching when server-side fetching is better
- make everything a Client Component
- use `useEffect` for initial server-owned data loading
- create API routes when a Server Action is the correct boundary
- mutate data without validation, authorization, and cache invalidation
- silently ignore TypeScript errors
- introduce unapproved state management libraries
- duplicate existing utilities, components, actions, schemas, or queries

Agents MUST:

- inspect existing project conventions before editing
- preserve current architecture unless asked to refactor
- prefer small, focused changes
- keep public and private runtime boundaries clear
- make loading, error, empty, and success states explicit
- keep accessibility built in from the start
- keep code readable for future maintainers

---

## 3. Architecture (MANDATORY)

Use this architecture unless the repository already has a stricter convention:

```txt
app/                 -> routes, layouts, pages, route handlers, server actions colocated when appropriate
components/          -> reusable UI components
features/            -> feature modules containing UI + application glue
lib/                 -> shared utilities, server-only helpers, clients, config
server/              -> server-only application, domain, data, auth, services
server/actions/      -> reusable Server Actions when not route-colocated
server/domain/       -> business rules and domain models
server/data/         -> ORM queries, repositories, database access
server/services/     -> application services and use cases
schemas/             -> Zod/Valibot/etc. validation schemas
config/              -> typed configuration
```

Preferred dependency rule:

```txt
app -> features/components -> server/services -> server/domain -> server/data
```

Rules:

- UI may call application services only through safe server boundaries.
- Server-only modules MUST NOT be imported into Client Components.
- Domain code MUST NOT depend on React, Next.js routing, or browser APIs.
- Data access MUST be centralized in repositories/query modules/services.
- Route Handlers and Server Actions MUST remain thin.
- Shared utilities MUST be framework-safe and environment-safe.

---

## 4. Next.js App Router Rules

Use App Router conventions:

- `app/layout.tsx` for root layout
- route segment `layout.tsx` for shared route UI
- `page.tsx` for route entry pages
- `loading.tsx` for route-level loading states
- `error.tsx` for route-level error boundaries
- `not-found.tsx` for 404 states
- `route.ts` for HTTP Route Handlers
- route groups with `(group-name)` for organization without URL impact
- dynamic segments with `[id]`, `[slug]`, `[...slug]`, or `[[...slug]]`

Rules:

- Keep route files thin.
- Move complex workflows into services or actions.
- Use nested layouts to avoid duplicated shell UI.
- Use route groups for separation by product area, auth area, or marketing/app split.
- Use `notFound()` when a resource does not exist.
- Use `redirect()` only after authorization and validation decisions are complete.
- Use `generateMetadata` for route-specific SEO metadata.
- Do not place large business logic directly inside `page.tsx`.

---

## 5. React Server Components Rules

Server Components are the default.

Use Server Components for:

- data fetching
- secure server-side rendering
- reading cookies/headers when needed
- composing layouts
- accessing server-only utilities
- rendering non-interactive UI
- reducing client JavaScript
- SEO-sensitive content

Server Components MUST NOT:

- use browser-only APIs
- use React client hooks such as `useState`, `useEffect`, `useReducer`, `useRef` for UI behavior
- attach event handlers such as `onClick`
- import Client Component-only libraries directly
- expose secrets or sensitive raw data to the client

Rules:

- Fetch data as close as possible to the route or component that needs it.
- Prefer parallel data fetching over sequential fetching when requests are independent.
- Use `Suspense` for streaming expensive or slow sections.
- Keep sensitive logic server-only.
- Pass only serialized, minimal props to Client Components.

---

## 6. Client Components Rules

Use Client Components only when required.

A component may use `'use client'` only for:

- local interactive state
- event handlers
- browser APIs
- effects that genuinely require the browser
- controlled form inputs when necessary
- client-side libraries that require DOM access
- animations and gestures
- optimistic UI
- ephemeral UI state

Client Components MUST NOT:

- fetch initial server-owned data with `useEffect` when it can be fetched on the server
- import server-only modules
- read secrets
- perform privileged authorization logic
- contain core business rules
- become large page-level containers by default
- receive non-serializable props from Server Components

Rules:

- Put `'use client'` at the smallest possible component boundary.
- Keep Client Components leaf-level when possible.
- Pass minimal props from Server Components.
- Prefer composition: Server Component parent, Client Component island.
- Avoid turning an entire route into a Client Component for one button, modal, or dropdown.

---

## 7. Server Actions Rules

Use Server Actions for trusted server-side mutations.

Server Actions are appropriate for:

- form submissions
- creating records
- updating records
- deleting records
- authenticated mutations
- cache revalidation after writes
- workflows that do not require a public API endpoint

Server Actions MUST:

- run only on the server
- validate all input using the project-approved validation library
- check authentication
- check authorization
- call application services or domain logic
- handle expected errors safely
- return serializable results
- revalidate affected cache paths or tags when data changes
- avoid leaking internal errors to the client

Server Actions MUST NOT:

- trust form data directly
- contain large business workflows inline
- bypass application/domain services
- expose secrets in return values
- return raw database objects when DTOs are safer
- perform destructive operations without explicit confirmation flow

Recommended pattern:

```ts
'use server'

export async function actionName(prevState: ActionState, formData: FormData) {
  // 1. authenticate
  // 2. authorize
  // 3. validate
  // 4. call service/use case
  // 5. revalidatePath/revalidateTag
  // 6. return safe serializable state
}
```

---

## 8. Route Handler Rules

Use `route.ts` only when an explicit HTTP boundary is required.

Route Handlers are appropriate for:

- public APIs
- webhooks
- third-party callbacks
- file uploads/downloads
- service-to-service communication
- custom HTTP methods
- non-form JSON endpoints

Route Handlers MUST:

- validate request input
- authenticate when required
- authorize when required
- return correct HTTP status codes
- use typed response DTOs
- avoid leaking stack traces or internal details
- call services/use cases rather than embedding business logic

Route Handlers MUST NOT:

- duplicate Server Action logic without reason
- bypass validation
- expose raw database models unnecessarily
- handle browser UI concerns

---

## 9. Data Fetching Rules

Default data fetching strategy:

- Server Components fetch initial data.
- Client fetching is only for client-owned, realtime, highly interactive, or post-hydration data.
- Mutations happen through Server Actions or Route Handlers.

Rules:

- Fetch on the server whenever possible.
- Avoid `useEffect` + `fetch` for initial page data.
- Avoid request waterfalls.
- Use `Promise.all` for independent requests.
- Use streaming with `Suspense` for slow sections.
- Keep returned data minimal and shaped for the UI.
- Never send secrets, internal tokens, or unnecessary sensitive fields to Client Components.

Client-side data libraries such as SWR or TanStack Query are allowed only for:

- realtime-ish client state
- polling dashboards
- client-only filters/search after initial render
- background refresh UX
- infinite scroll
- optimistic updates where project conventions permit

---

## 10. Caching and Revalidation Rules

Caching MUST be intentional.

Agents MUST decide whether data is:

- static
- dynamic per request
- user-specific
- role-specific
- frequently changing
- safely cacheable
- unsafe to cache

Rules:

- Use static rendering for stable public pages.
- Use dynamic rendering for user-specific or request-specific pages.
- Use cache tags when multiple routes depend on the same data.
- Use path revalidation for route-specific changes.
- Revalidate after successful mutations.
- Never cache private user data in public/shared caches.
- Never serve stale authorization-sensitive data.
- Document unusual caching decisions in code comments.

Use:

- `revalidatePath()` when a route must refresh
- `revalidateTag()` when shared tagged data must refresh
- `no-store` or dynamic rendering for sensitive request-specific data
- cache tags for shared data dependencies

---

## 11. Rendering Strategy Rules

Choose rendering mode deliberately:

- Static rendering for public, stable content
- Dynamic rendering for authenticated, personalized, or request-specific content
- Streaming for slow or partially independent UI sections
- Client rendering only for browser-only experiences

Rules:

- Do not force dynamic rendering without reason.
- Do not force static rendering for user-specific data.
- Use `loading.tsx` for route-level pending states.
- Use Suspense boundaries around slow sections.
- Use skeletons when layout stability matters.
- Avoid blocking an entire page for non-critical data.

---

## 12. Navigation Rules

Use Next.js navigation primitives.

Use:

```tsx
import Link from 'next/link'

<Link href="/dashboard">Dashboard</Link>
```

Rules:

- Use `next/link` for internal navigation.
- Use native `<a>` for external links, downloads, anchors, and special protocols.
- Use `redirect()` in Server Components, Server Actions, and Route Handlers when server-side redirect is required.
- Use `useRouter()` only inside Client Components when client-side imperative navigation is truly needed.
- Prefer declarative navigation over imperative routing.

---

## 13. Redirect Rules

Server-side redirects:

```ts
import { redirect } from 'next/navigation'

redirect('/target')
```

Not found:

```ts
import { notFound } from 'next/navigation'

notFound()
```

Rules:

- Redirect after auth/authorization checks.
- Redirect after successful mutations only when it improves UX.
- Use `notFound()` for missing resources, not generic errors.
- Do not perform client-side redirects for server-known auth decisions unless required by UX.

---

## 14. UI State Rules

UI-only state belongs on the client.

Use local Client Component state for:

- dropdowns
- tabs
- popovers
- accordions
- temporary form UI
- optimistic UI state
- animation state
- non-persistent toggles

Use URL state for:

- search queries
- filters
- pagination
- sorting
- shareable view state

Use server/database state for:

- authenticated user data
- persisted preferences
- application records
- permissions
- workflow status

Rules:

- Do not store server truth in client-only state.
- Do not use global state for local component concerns.
- Prefer URL search params for shareable filters.
- Use a global state library only if the project already uses one or the user approves it.

---

## 15. Forms Rules

Forms MUST be secure, accessible, and server-validated.

Preferred mutation paths:

1. Server Action for normal app forms.
2. Route Handler for explicit API/HTTP needs.
3. Client-side mutation library only when justified by UX requirements.

Every critical form MUST:

- validate on the server
- authorize on the server
- show pending state
- show success or error state
- preserve user input after validation errors when possible
- protect against duplicate submissions
- handle expected failures cleanly

Validation rules:

- Use shared schemas when safe.
- Treat client validation as UX only.
- Treat server validation as mandatory.
- Never trust hidden fields.
- Never trust IDs from client input without ownership/authorization checks.

---

## 16. Modal Rules

Use modals only when they improve the workflow.

Rules:

- Modal open/close state is client UI state.
- Modal form submission must go through Server Actions or approved mutation flow.
- Modals must be keyboard accessible.
- Modals must trap focus when open.
- Modals must restore focus when closed.
- Destructive modals must clearly communicate consequences.
- Do not hide complex multi-step workflows inside cramped modals unless UX requires it.

Forms may be inline or modal depending on UX, unless the project explicitly mandates modal-only forms.

---

## 17. Delete and Destructive Action Rules

All destructive actions MUST require confirmation.

Examples:

- delete record
- remove user access
- cancel subscription
- revoke token
- reset configuration
- irreversible import/export changes

Rules:

- Confirm before destructive mutation.
- Use clear action labels such as `Delete`, `Remove`, `Revoke`, or `Cancel`.
- Show the affected entity name when possible.
- Require stronger confirmation for high-risk actions.
- Server Action or Route Handler MUST re-check authorization.
- Mutation MUST invalidate relevant caches after success.

---

## 18. Business Logic Placement

Business logic MUST NOT be placed in:

- JSX rendering branches beyond simple display logic
- Client Components
- `page.tsx` files
- `layout.tsx` files
- Route Handlers directly
- Server Actions directly
- middleware except lightweight request decisions
- validation schemas beyond validation rules

Business logic SHOULD be placed in:

- domain classes/functions
- application services
- use case functions
- policy/authorization modules
- repository/query modules when data-specific

Examples of business logic:

- pricing rules
- eligibility rules
- permission decisions
- workflow transitions
- quota calculations
- billing behavior
- status transitions
- inventory rules
- ownership checks

---

## 19. Database Rules (STRICT)

Agents MUST NOT assume the database schema.

Before database-related code changes, agents MUST inspect:

- existing schema/migration files
- ORM models/schema definitions
- query modules/repositories
- live database schema when database inspection tools are available

Database-related requests include:

- creating tables
- modifying tables
- renaming tables
- dropping tables
- adding columns
- renaming columns
- changing column types
- dropping columns
- adding/removing indexes
- adding/removing foreign keys
- modifying constraints
- schema-level data migrations
- enum/value structure changes
- persistence behavior changes

For every database-related request, agents MUST:

1. Inspect current codebase schema/migrations.
2. Inspect affected models and query usage.
3. Inspect live DB schema using approved database tools when available.
4. Verify the actual schema before writing migration code.
5. Avoid duplicate migrations.
6. Preserve existing data unless the user explicitly requests removal.
7. Make schema changes reversible when possible.
8. Verify generated migration matches intended database change.

Application code MUST use the project-approved data access layer, such as:

- Prisma
- Drizzle
- Kysely
- direct SQL wrapper
- repository pattern
- typed query builder

Raw SQL is allowed only when technically required for:

- complex indexes
- database-specific constraints
- performance-critical queries
- safe data migrations
- operations unsupported by the ORM

Raw SQL rules:

- MUST be justified by technical necessity
- MUST be parameterized
- MUST preserve existing data unless explicitly destructive
- MUST be reviewed for injection risks
- MUST not bypass authorization or validation

---

## 20. Migration Rules

Every database schema change MUST have a migration or equivalent versioned schema change.

Migration MUST:

- match the live database schema
- be reversible when the tool supports it
- preserve existing data unless explicitly requested otherwise
- use the project-approved migration tool
- follow existing naming conventions
- be committed with related schema/model changes
- be reflected in the ORM schema or generated types
- include safe defaults/backfills for non-null additions
- avoid long locks on large tables when possible

Agents MUST NOT:

- create a migration based only on assumptions
- create duplicate migrations for existing schema changes
- edit old migrations that have already been applied unless the project convention allows it and the user explicitly asks
- run destructive reset commands
- use production-like destructive operations casually
- mark migrations as applied without verifying the actual schema state

---

## 21. Database Change Flow (MANDATORY)

For schema/database structure changes, agents MUST follow this flow:

1. Analyze existing migrations/schema files.
   - Check previous migrations.
   - Verify whether the requested change already exists.
   - Match project naming and ordering conventions.

2. Inspect data access usage.
   - Find affected queries.
   - Find affected services.
   - Find affected API responses and UI assumptions.

3. Inspect live database schema when tools are available.
   - Read affected tables.
   - Read related tables for relationships/foreign keys.
   - Confirm indexes, constraints, defaults, and nullability.

4. Create a migration/schema change.
   - Use the project-approved migration tool.
   - Preserve data.
   - Include reversible logic when possible.
   - Include backfill strategy when required.

5. Update application code.
   - Update schema/types.
   - Update repositories/queries.
   - Update services/use cases.
   - Update forms/actions/routes.
   - Update UI states if affected.

6. Verify consistency.
   - Migration matches schema intent.
   - Generated types match code usage.
   - Data access layer is updated.
   - No duplicate or conflicting schema logic exists.

---

## 22. Authentication Rules

Authentication MUST be handled server-side.

Rules:

- Protect private routes on the server.
- Do not rely only on client-side route guards.
- Use middleware only for lightweight checks and redirects.
- Perform full authorization in Server Components, Server Actions, Route Handlers, or services.
- Do not expose tokens, secrets, or raw session internals to Client Components.
- Use secure, HTTP-only cookies when applicable.
- Re-check permissions at mutation time.

Agents MUST verify existing auth library/conventions before implementing auth changes.

Possible auth tools may include:

- NextAuth/Auth.js
- Clerk
- Supabase Auth
- custom session auth
- enterprise SSO/OIDC/SAML

Do not introduce a new auth provider without explicit approval.

---

## 23. Authorization and Policy Rules

Authorization is mandatory for protected resources.

Rules:

- Authentication answers: who is the user?
- Authorization answers: may this user perform this action on this resource?
- Every protected read must check access.
- Every protected mutation must check access.
- Client-side hiding of buttons is not authorization.
- Use policy functions/modules for reusable permission checks.
- Keep authorization decisions close to the server operation.

Recommended pattern:

```txt
Server Action / Route Handler -> authenticate -> authorize -> validate -> service -> data
```

---

## 24. Security Rules

Agents MUST enforce:

- no secrets in code
- no hardcoded credentials
- no private keys in client bundles
- no sensitive values with `NEXT_PUBLIC_`
- server-side validation for critical flows
- authorization checks before protected reads/writes
- parameterized queries
- safe file upload handling
- safe redirects
- CSRF-aware mutation strategy
- XSS-safe rendering
- secure cookie settings
- least-privilege data exposure

Environment variable rules:

- Server-only environment variables MUST NOT use `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_` means the value is exposed to the browser bundle.
- Validate required environment variables at startup/build when project conventions support it.
- Keep `.env.local` out of version control.
- Provide `.env.example` without real secrets.

Headers and browser security:

- Use secure headers where appropriate.
- Use CSP when project supports it.
- Avoid unsafe inline scripts.
- Use `next/script` for third-party scripts.
- Minimize third-party script impact.

---

## 25. Middleware Rules

Middleware is for lightweight request-level logic.

Use middleware for:

- simple auth redirects
- locale routing
- A/B routing
- request rewrites
- lightweight header logic
- coarse route protection

Middleware MUST NOT:

- contain heavy business logic
- perform slow database queries unless the project explicitly supports it
- replace full authorization checks
- run large dependencies unnecessarily
- mutate application data

Rules:

- Keep middleware small and fast.
- Full authorization still happens in server actions, route handlers, services, or server-rendered routes.
- Be aware of runtime limitations.

---

## 26. Error Handling Rules

Every route and mutation should have clear failure behavior.

Use:

- `error.tsx` for route segment errors
- `not-found.tsx` for missing resources
- typed action states for form errors
- structured error responses for APIs
- logging for unexpected server errors

Rules:

- Do not expose stack traces to users.
- Do not swallow errors silently.
- Separate expected validation errors from unexpected system errors.
- Use user-safe messages.
- Log enough context for debugging without leaking secrets.
- Provide retry options where appropriate.

---

## 27. Loading, Empty, and Success States

Every async UI path MUST consider:

- loading state
- empty state
- error state
- success state
- permission denied state when applicable

Rules:

- Use `loading.tsx` for route-level loading.
- Use `Suspense` for component-level streaming.
- Use skeletons for layout stability.
- Use empty states with helpful next actions.
- Use optimistic UI only when rollback is safe and implemented.

---

## 28. Performance Rules

Agents MUST optimize for:

- minimal client JavaScript
- server-first rendering
- fast TTFB where appropriate
- good LCP/CLS/INP
- small bundles
- parallel data loading
- image optimization
- font optimization
- route-level code splitting

Rules:

- Do not mark large trees as Client Components unnecessarily.
- Use `next/image` for images when possible.
- Use `next/font` for fonts.
- Use `next/script` for third-party scripts.
- Avoid importing heavy libraries into Client Components.
- Prefer dynamic import for heavy client-only components.
- Avoid unnecessary providers at the root layout.
- Keep context providers as deep as possible.
- Use pagination, infinite scroll, or streaming for large lists.
- Avoid N+1 query patterns.

---

## 29. Image, Font, and Script Rules

Images:

- Use `next/image` for local and remote images when possible.
- Always provide meaningful `alt` text unless decorative.
- Set dimensions or use fill with stable container sizing.
- Configure allowed remote image domains/patterns.
- Prioritize only critical above-the-fold images.

Fonts:

- Use `next/font` when possible.
- Avoid layout shift from font loading.
- Prefer local or optimized fonts.

Scripts:

- Use `next/script` for third-party scripts.
- Pick the correct loading strategy.
- Do not add blocking scripts casually.
- Avoid third-party scripts in root layout unless globally required.

---

## 30. SEO and Metadata Rules

Use the Metadata API.

Rules:

- Define global metadata in root layout.
- Define route-specific metadata with `metadata` or `generateMetadata`.
- Include title, description, canonical where needed, Open Graph, and Twitter metadata when relevant.
- Use structured data for content that benefits from it.
- Do not duplicate conflicting metadata across nested layouts.
- Ensure protected/private pages do not expose sensitive metadata.

---

## 31. Accessibility Rules

Accessibility is mandatory.

Agents MUST:

- use semantic HTML
- preserve keyboard navigation
- provide visible focus states
- label form controls
- use ARIA only when semantic HTML is insufficient
- maintain color contrast
- provide alt text for meaningful images
- make modals, menus, tabs, and popovers accessible
- avoid click-only interactions
- respect reduced motion preferences

Agents MUST NOT:

- use div/button substitutes without keyboard support
- remove outlines without replacement
- hide important content from assistive tech incorrectly
- rely only on color to communicate state

---

## 32. Styling Rules

Follow the existing styling system.

If Tailwind CSS is used:

- Use utility classes consistently.
- Extract repeated patterns into components.
- Keep class names readable.
- Use design tokens/theme values.
- Avoid arbitrary values unless justified.

If CSS Modules, vanilla-extract, styled-components, or another system is used:

- Follow existing conventions.
- Do not introduce Tailwind without approval.
- Do not mix styling systems unnecessarily.

Component styling rules:

- Components should support composition.
- Variants should be typed.
- Shared primitives should be reusable.
- Avoid one-off styling that duplicates design system components.

---

## 33. Component Rules

Components should be small, focused, and composable.

Rules:

- Use Server Components by default.
- Use Client Components only for interactivity.
- Keep props typed.
- Keep component APIs minimal.
- Avoid deeply nested prop drilling.
- Prefer composition over configuration when readable.
- Do not duplicate existing components.
- Keep feature-specific components inside feature folders.
- Keep truly shared components in shared component directories.

Component categories:

- page components: route entry composition
- layout components: structure and shell
- feature components: domain-specific UI
- primitive components: buttons, inputs, dialogs
- client islands: interactive leaf components

---

## 34. TypeScript Rules

TypeScript is mandatory.

Rules:

- Avoid `any` unless technically justified.
- Prefer `unknown` over `any` for untrusted input.
- Type all public function boundaries.
- Use inferred types for obvious local variables.
- Use schema-derived types when possible.
- Use discriminated unions for state machines and action results.
- Do not suppress TypeScript errors without a comment explaining why.
- Keep DTOs explicit at API/server-client boundaries.

Recommended patterns:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
```

---

## 35. Validation Rules

Validation is mandatory at trust boundaries.

Trust boundaries include:

- form submissions
- URL params
- search params
- cookies
- headers
- webhook payloads
- uploaded files
- external API responses
- database records when shape may be unsafe

Rules:

- Use the project-approved validation library.
- Validate on the server for critical flows.
- Validate URL/search params before use.
- Validate file type, size, and content expectations.
- Validate webhook signatures before processing.
- Return field-level errors for forms when possible.

---

## 36. API and DTO Rules

APIs MUST use explicit request and response shapes.

Rules:

- Do not expose raw database records by default.
- Use DTOs for client-facing responses.
- Keep response fields minimal.
- Include stable IDs only when needed.
- Avoid exposing internal flags, secrets, or implementation details.
- Version public APIs when compatibility matters.
- Validate external API responses before trusting them.

---

## 37. File Upload Rules

File uploads MUST be treated as untrusted input.

Rules:

- Validate file size.
- Validate file type.
- Validate extension and MIME expectations.
- Store files in approved storage.
- Never trust original filenames.
- Generate safe storage keys.
- Scan or sanitize files when required by project/security posture.
- Keep upload authorization server-side.
- Do not expose private files through public URLs unless intended.

---

## 38. Realtime and Polling Rules

Realtime behavior must be justified.

Preferred order:

1. Server-rendered data with revalidation
2. Client refresh on user action
3. SWR/TanStack Query background refresh
4. Server-Sent Events/WebSockets when truly needed
5. Polling only when simpler options are insufficient

Polling rules:

- Do not poll unless required.
- Use the longest acceptable interval.
- Pause when tab is hidden if supported.
- Keep payloads small.
- Avoid polling authenticated sensitive endpoints without need.

---

## 39. Runtime Rules

Next.js supports different runtimes. Choose intentionally.

Node.js runtime is appropriate for:

- database access requiring Node APIs
- file system operations
- most server-side business logic
- libraries that require Node.js

Edge runtime is appropriate for:

- lightweight middleware
- low-latency request decisions
- simple redirects/rewrites
- limited compute without Node-only dependencies

Rules:

- Do not use Edge runtime for code requiring unsupported Node APIs.
- Do not import heavy server dependencies into middleware.
- Keep runtime-specific code isolated.

---

## 40. Package and Dependency Rules

Before adding a dependency, agents MUST check:

- existing dependencies
- existing utilities/components
- bundle impact
- maintenance status
- security posture
- whether native Next.js/React capabilities already solve the problem

Rules:

- Do not add libraries for trivial utilities.
- Do not add a new state library without approval.
- Do not add a new UI library without approval.
- Do not add overlapping libraries.
- Use the repository's package manager.
- Preserve lockfile consistency.

---

## 41. Testing Rules

Follow the user's instruction and project conventions.

Agents MUST NOT run tests unless the user explicitly asks or the task instructions allow it.

When tests are requested or allowed:

- use the existing test runner
- run the smallest relevant test scope first
- do not run destructive integration tests without approval
- do not update snapshots blindly
- report what was run and what passed/failed

Suggested test coverage for changes:

- domain logic unit tests
- service/use case tests
- Server Action tests where supported
- Route Handler tests for APIs/webhooks
- component tests for interactive UI
- end-to-end tests for critical flows

---

## 42. Forbidden Commands

Agents MUST NOT run destructive or unsafe commands unless the user explicitly requests and confirms the exact impact.

Forbidden by default:

- database reset commands
- production destructive commands
- deleting migrations casually
- deleting user data
- force pushing
- removing lockfiles to solve dependency issues
- disabling TypeScript or lint rules globally to make errors disappear
- committing secrets

Examples:

```bash
rm -rf .next node_modules
npm audit fix --force
prisma migrate reset
DROP DATABASE
TRUNCATE TABLE
```

These are only allowed with explicit user approval and a clear recovery plan when appropriate.

---

## 43. Observability and Logging Rules

Server-side operations should be debuggable.

Rules:

- Log unexpected errors server-side.
- Do not log secrets, tokens, passwords, or sensitive payloads.
- Include request/user/resource context where safe.
- Use project-approved logging/monitoring tools.
- Add metrics/tracing for critical workflows when project conventions support it.
- Keep client console noise minimal.

---

## 44. Internationalization Rules

If the project supports multiple languages:

- use the existing i18n framework
- keep translated strings out of business logic
- avoid hardcoded user-facing text in shared components
- format dates, numbers, and currency by locale
- ensure metadata also respects locale when needed

Do not introduce i18n infrastructure without approval.

---

## 45. Search Params and URL State Rules

Use search params for shareable UI state.

Examples:

- `?q=keyword`
- `?page=2`
- `?sort=createdAt.desc`
- `?status=active`

Rules:

- Validate search params before using them.
- Provide safe defaults.
- Keep URLs stable and readable.
- Do not store sensitive data in URLs.
- Use server-side parsing for server-rendered views.
- Use client-side updates only for interactive filter UX.

---

## 46. Environment and Configuration Rules

Configuration MUST be typed and validated when project conventions support it.

Rules:

- Keep server env private.
- Use `NEXT_PUBLIC_` only for values intentionally exposed to browsers.
- Validate required env vars.
- Provide safe defaults only when truly safe.
- Keep `.env.example` updated.
- Never commit `.env.local` or real secrets.

Recommended structure:

```txt
config/env.ts       -> validated environment variables
config/site.ts      -> public site config
config/routes.ts    -> route constants when useful
```

---

## 47. Monorepo Rules

If the project is in a monorepo:

- respect workspace boundaries
- use existing package names and aliases
- do not create circular dependencies
- do not import app-only modules into shared packages
- keep shared packages framework-neutral unless intentionally Next.js-specific
- update affected package configs when adding dependencies

---

## 48. Code Modification Workflow

For every code change, agents SHOULD follow this workflow:

1. Inspect existing structure and conventions.
2. Identify whether the change affects UI, server, domain, data, or infrastructure.
3. Make the smallest safe change.
4. Keep Server Components as default.
5. Add Client Components only at interactive boundaries.
6. Validate inputs at server boundaries.
7. Check authorization for protected resources.
8. Update cache revalidation after mutations.
9. Add or update loading/error/empty states where relevant.
10. Update types and schemas.
11. Avoid unrelated refactors.
12. Summarize changed files and reasoning.

---

## 49. Feature Implementation Workflow

For new features:

1. Understand route and UX requirements.
2. Check existing components, services, schemas, and data models.
3. Define data requirements.
4. Create/update domain rules.
5. Create/update application service/use case.
6. Create/update data access query/repository.
7. Create Server Action or Route Handler if mutation/API is needed.
8. Compose route with Server Components.
9. Add Client Component islands for interactivity only.
10. Add form validation and action state.
11. Add loading, empty, error, and success states.
12. Add metadata when public/SEO-relevant.
13. Add cache invalidation after mutations.
14. Keep accessibility and performance requirements satisfied.

---

## 50. Import Boundary Rules

Use clear import boundaries.

Rules:

- Client Components MUST NOT import server-only modules.
- Server-only files SHOULD use `server-only` where project conventions support it.
- Shared modules MUST be safe for both server and client.
- Do not import database clients into UI components.
- Do not import Node-only modules into Client Components or Edge runtime.
- Keep barrel exports from accidentally exposing server-only code to client bundles.

Recommended naming hints:

```txt
*.server.ts     -> server-only code
*.client.tsx    -> client component or browser-only code
*.schema.ts     -> validation schema
*.action.ts     -> server action
*.query.ts      -> data read query
*.mutation.ts   -> data write helper
*.policy.ts     -> authorization policy
```

---

## 51. Server-Client Data Boundary Rules

Data passed from server to client MUST be:

- serializable
- minimal
- safe to expose
- shaped for the UI
- free from secrets/internal-only fields

Do not pass:

- database client instances
- functions from Server Components to Client Components except supported Server Action patterns
- class instances that cannot serialize safely
- raw sessions/tokens
- internal permission maps unless safe
- excessive records when pagination is needed

---

## 52. Cache Invalidation After Mutations

Every mutation must consider cache invalidation.

After successful create/update/delete:

- revalidate affected paths
- revalidate affected tags
- refresh client router only when client UX requires it
- update optimistic state if used
- ensure stale data is not shown for protected workflows

Rules:

- Do not revalidate the entire app unless necessary.
- Prefer targeted tags/paths.
- Keep cache dependencies understandable.

---

## 53. Optimistic UI Rules

Optimistic UI is allowed only when rollback is safe.

Rules:

- Show pending state.
- Handle server rejection.
- Roll back failed optimistic updates.
- Do not use optimistic UI for high-risk destructive actions unless carefully designed.
- Do not show unauthorized state as successful before server confirmation.

---

## 54. Webhook Rules

Webhook Route Handlers MUST:

- verify provider signature
- validate payload shape
- be idempotent
- handle retries safely
- avoid duplicate side effects
- return appropriate status codes
- log unexpected failures safely
- not expose internal errors

Webhook processing SHOULD move business logic into services/use cases.

---

## 55. Background Jobs and Async Work Rules

If background processing exists:

- use the project-approved queue/job system
- keep job payloads minimal
- make jobs idempotent
- handle retries safely
- log failures
- avoid storing secrets in job payloads

Do not invent a queue system without approval.

---

## 56. Payments and Billing Rules

Billing changes are high risk.

Agents MUST:

- validate webhook signatures
- rely on provider events for source of truth where appropriate
- make billing mutations idempotent
- avoid trusting client-reported payment status
- keep pricing rules in domain/application logic
- protect billing routes with authorization
- log billing events safely

---

## 57. Admin and Internal Tooling Rules

Admin features require stricter authorization.

Rules:

- Server-check admin permissions on every admin route and mutation.
- Do not rely on hidden links or client-only checks.
- Add audit logging for sensitive admin actions when project conventions support it.
- Confirm destructive actions.
- Paginate large admin datasets.
- Avoid exposing unnecessary PII.

---

## 58. Accessibility Checklist for Interactive Components

For dialogs, dropdowns, menus, tabs, comboboxes, and popovers:

- keyboard navigation works
- focus management works
- escape behavior works where expected
- ARIA roles/states are correct when needed
- screen reader labels are present
- disabled states are communicated
- click outside behavior does not trap users unexpectedly

Prefer battle-tested accessible primitives already used in the project.

---

## 59. Review Checklist Before Final Response

Before finishing, agents SHOULD verify:

- no Laravel, Livewire, Blade, Alpine, PHP, Eloquent, or Artisan assumptions remain unless explicitly part of migration docs
- Server Components remain default
- Client Components are justified
- server validation exists
- authorization exists for protected operations
- cache invalidation exists after mutations
- loading/error/empty states are handled
- TypeScript types are safe
- environment variables are not exposed accidentally
- data fetching does not create avoidable waterfalls
- accessibility is preserved
- changes follow existing project conventions
- no destructive commands were used

---

## 60. Final Principle

Use Next.js as a server-first full-stack framework.

Maximize its strengths:

- Server Components for secure, low-JavaScript rendering
- App Router for nested layouts and route-level architecture
- Server Actions for trusted mutations
- Route Handlers for explicit HTTP boundaries
- Streaming and Suspense for fast perceived performance
- caching and revalidation for scalable data freshness
- built-in image, font, script, and metadata optimization
- strict TypeScript for maintainability
- clear server/client boundaries for security and performance

Correct boundaries are mandatory.

Server truth stays on the server.
Client interactivity stays minimal and intentional.
Business rules stay in domain/application layers.