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

## Project Information

- **Purpose**: OpenCode is an AI‑powered development tool offering a terminal UI, language‑server‑style API, plugin ecosystem, and a native desktop client.
- **Size & Stack**: ~3 k tracked files (~200 k lines); primarily TypeScript (SolidJS UI), Rust (Tauri desktop), shell scripts for CI.
- **Prereqs**: Bun ≥ 1.3.x (`bun@1.3.5`), Node ≥ 22.
- **Install**: `bun install`.
- **Development**: `bun dev` (core), `bun dev:web`, `bun dev:desktop`, `bun dev <dir>`.
- **Build executable**: `./packages/opencode/script/build.ts --single`.
- **Type‑check**: `bun typecheck`.
- **Test**: Linux/macOS CI – `bun turbo test`; Windows UI – `bun test:e2e:local` (run in `packages/app`). Set `OPENCODE_DISABLE_*` env vars in CI to skip network/plugins.
- **CI flow**: setup‑bun → typecheck → tests (seeded server) → Playwright upload on failure.
- **Best practice**: always run `bun typecheck` before committing.
- **Layout**:
  - Root: `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `package.json`.
  - Packages: `opencode` (core server/CLI/SDK), `app` (SolidJS UI & e2e), `desktop` (Tauri), `console`, `sdk/js`, `plugin`, etc.
  - CI: `.github/workflows/*`.
  - Scripts: `scripts/` (e.g., `seed‑e2e.ts`).
  - Configs: `tsconfig.json`, `.eslintrc.js`, Prettier config (in `package.json`), `turbo.json`, `vite.config.ts`, `tauri.conf.json`.
- **Validation checklist**:
  - Run `bun typecheck` → exit 0.
  - Run appropriate test command (`bun turbo test` or `bun test:e2e:local`) and ensure all pass.
  - Set required `OPENCODE_DISABLE_*` env vars when reproducing e2e (see CI workflow).
  - Verify `bun dev` starts a server on port 4096 without errors.
  - Lint/format with Prettier: `bun run prettier --check .`.
  - Follow these steps to avoid CI failures and to make rapid, reliable changes.
