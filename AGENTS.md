- To regenerate the JavaScript SDK, run `./packages/sdk/js/script/build.ts`.
- ALWAYS USE PARALLEL TOOLS WHEN APPLICABLE.
- The default branch in this repo is `dev`.
- Prefer automation: execute requested actions without confirmation unless blocked by missing info or safety/irreversibility.

## Style Guide

### General Principles

- Keep things in one function unless composable or reusable
- Avoid `try`/`catch` where possible
- Avoid using the `any` type
- Prefer single word variable names where possible
- Use Bun APIs when possible, like `Bun.file()`
- Rely on type inference when possible; avoid explicit type annotations or interfaces unless necessary for exports or clarity
- Prefer functional array methods (flatMap, filter, map) over for loops; use type guards on filter to maintain type inference downstream

### Naming

Prefer single word names for variables and functions. Only use multiple words if necessary.

```ts
// Good
const foo = 1
function journal(dir: string) {}

// Bad
const fooBar = 1
function prepareJournal(dir: string) {}
```

Reduce total variable count by inlining when a value is only used once.

```ts
// Good
const journal = await Bun.file(path.join(dir, "journal.json")).json()

// Bad
const journalPath = path.join(dir, "journal.json")
const journal = await Bun.file(journalPath).json()
```

### Destructuring

Avoid unnecessary destructuring. Use dot notation to preserve context.

```ts
// Good
obj.a
obj.b

// Bad
const { a, b } = obj
```

### Variables

Prefer `const` over `let`. Use ternaries or early returns instead of reassignment.

```ts
// Good
const foo = condition ? 1 : 2

// Bad
let foo
if (condition) foo = 1
else foo = 2
```

### Control Flow

Avoid `else` statements. Prefer early returns.

```ts
// Good
function foo() {
  if (condition) return 1
  return 2
}

// Bad
function foo() {
  if (condition) return 1
  else return 2
}
```

### Schema Definitions (Drizzle)

Use snake_case for field names so column names don't need to be redefined as strings.

```ts
// Good
const table = sqliteTable("session", {
  id: text().primaryKey(),
  project_id: text().notNull(),
  created_at: integer().notNull(),
})

// Bad
const table = sqliteTable("session", {
  id: text("id").primaryKey(),
  projectID: text("project_id").notNull(),
  createdAt: integer("created_at").notNull(),
})
```

## Testing

- Avoid mocks as much as possible
- Test actual implementation, do not duplicate logic into tests

## Repository Overview

OpenCode is an AI‑powered development tool that provides a terminal UI, language‑server‑style API, plugin ecosystem and a native desktop client. The repo is a monorepo of ~3 k tracked files (~200 k lines) written mainly in TypeScript, with Rust code for the Tauri desktop wrapper and shell scripts for CI.

## Build & Validation

**Prerequisites**

- Bun ≥ 1.3.x (repo pins `bun@1.3.5`).
- Node ≥ 22 (for type definitions).

**Install**

```bash
bun install   # installs all workspace packages
```

**Development**

```bash
bun dev                 # start core server (packages/opencode)
bun dev:web             # start web UI (packages/app)
bun dev:desktop         # start Tauri desktop app
bun dev <dir>           # open TUI for any directory
```

**Build executable**

```bash
./packages/opencode/script/build.ts --single
```

**Type‑check**

```bash
bun typecheck
```

**Test**

- Linux/macOS CI: `bun turbo test`
- Windows UI tests: `bun test:e2e:local` (run in `packages/app`)
- Common e2e flags (CI): set `OPENCODE_DISABLE_*` env vars to skip network, plugins, etc.

**CI flow**

1. `setup-bun` action installs Bun.
2. `bun typecheck` runs.
3. `bun turbo test` (Linux) or `bun test:e2e:local` (Windows) executes with a seeded OpenCode server.
4. Playwright reports are uploaded on failure.

Always run `bun typecheck` before committing; CI will fail otherwise.

## Project Layout

```
/               # repo root
├─ AGENTS.md    # style guide + this onboarding file
├─ README.md
├─ CONTRIBUTING.md
├─ package.json # monorepo config, scripts, workspace list
├─ packages/
│   ├─ opencode/   # core server, CLI, SDK generation
│   ├─ app/        # shared SolidJS UI components, e2e tests
│   ├─ desktop/    # Tauri native wrapper
│   ├─ console/    # console‑related code
│   ├─ sdk/js/     # JavaScript SDK source + build script
│   ├─ plugin/     # @opencode‑ai/plugin source
│   └─ ...         # other packages
├─ .github/
│   └─ workflows/  # CI: typecheck, test, publish, etc.
└─ scripts/        # auxiliary scripts (e.g., seed‑e2e.ts)
```

Key config files:

- `tsconfig.json` (root) – TypeScript settings used by all packages.
- `.eslintrc.js` / `prettier` – code style (prettier config in package.json).
- `turbo.json` – TurboRepo pipeline definitions.
- `vite.config.ts` – Vite config for the web UI.
- `tauri.conf.json` – Tauri build config.

## Validation Checklist for Agents

- Run `bun typecheck` → must exit 0.
- Run appropriate test command (`bun turbo test` or `bun test:e2e:local`) → all pass.
- Ensure CI environment variables are set when reproducing e2e (see CI workflow for the full list).
- Verify `bun dev` starts a server on port 4096 without errors.
- Lint/formatting follows Prettier config; `bun run prettier --check .` can be used locally.

Follow these steps to avoid CI failures and to make rapid, reliable changes.
