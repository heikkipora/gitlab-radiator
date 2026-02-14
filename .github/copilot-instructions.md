This repository is a small Node.js + React radiator that fetches CI pipelines from GitLab and serves a live dashboard.

Purpose for an AI coding agent
- Help maintain and extend the server-side polling & GitLab API logic in `src/gitlab/*`.
- Help evolve the client UI in `src/client/*` while preserving the Socket.IO state contract.
- Be conservative: prefer minimal, focused changes that keep the current runtime behavior and configuration semantics.

Big picture
- The server (`src/app.ts`) loads a YAML config (`~/.gitlab-radiator.yml` or `GITLAB_RADIATOR_CONFIG`) and repeatedly calls `update(config)` from `src/gitlab/index.ts` to produce a `globalState` object.
- The server emits `state` via Socket.IO to clients. The client entry is `src/client/index.tsx` which listens for the `state` event and renders via React components such as `groupedProjects.tsx`.
- GitLab API interactions are implemented under `src/gitlab` (`client.ts`, `projects.ts`, `pipelines.ts`, `runners.ts`). `client.ts` uses axios with a cached client per GitLab URL and passes `ca` into the https.Agent when configured.

Key files (examples)
- Server start / main loop: `src/app.ts` (socket gating, `runUpdate()`, error handling)
- Config loading & normalization: `src/config.ts` (YAML file loading, env overrides, interval/port normalization)
- GitLab API client: `src/gitlab/client.ts` (lazy client cache, `gitlabRequest()`)
- GitLab update orchestration: `src/gitlab/index.ts` (fetch projects + pipelines, filtering)
- Frontend entry and Socket.IO usage: `src/client/index.tsx` (listens to `state` and applies `argumentsFromDocumentUrl()`)
- CLI / installable binary: `bin/gitlab-radiator.ts` (installed via npm `bin` in `package.json`)

Build / run / test commands (exact)
- Use `nvm use` always first to select correct Node.js version as per `.nvmrc`.
- Start server in dev/prod: `npm start` (runs `node src/app.ts`).
- Build distribution: `npm run build` (invokes `./build-npm` wrapper in the repo root).
- Lint and auto-fix: `npm run eslint`.
- Typecheck: `npm run typecheck`.
- Run tests: `npm test` Tests live under `test/*.ts`.
- When talking to an on-prem GitLab with self-signed certs, either set `gitlabs[].caFile` in config or run: `NODE_TLS_REJECT_UNAUTHORIZED=0 gitlab-radiator`.

Project conventions and patterns
- ESM modules: `package.json` has `"type": "module"` — use `import`/`export` style and avoid CommonJS `require` unless very deliberate.
- All code is in TypeScript (`.ts`/`.tsx`), but runtime type checks are not enforced; treat types as documentation and IDE assistance. No need to transpile or use ts-node for backend code.
- Config-first: almost all behavior is driven by `~/.gitlab-radiator.yml`. `src/config.ts` maps YAML values to normalized runtime values (note: `interval` is converted to milliseconds).
- Socket contract is stable: server emits `state` (object with `projects`, `now`, `error`, `zoom`, `columns`, `projectsOrder`, `horizontal`, `groupSuccessfulProjects`); the client expects that shape. Changing the contract requires coordinated server+client changes.
- GitLab clients are cached by URL in `src/gitlab/client.ts`; create clients via `lazyClient(gitlab)` to reuse keep-alive connections.
- CA handling: `config.gitlabs[].caFile` is read in `src/config.ts` and passed as `ca` to axios `https.Agent` in `client.ts`.

Safe edit guidance for agents
- Small, isolated changes preferred. When changing data shapes emitted as `state`, update `src/client/*` in the same PR to keep runtime compatibility.
- Preserve environment-driven behavior: `GITLAB_ACCESS_TOKEN`, `GITLAB_RADIATOR_CONFIG`, and `NODE_TLS_REJECT_UNAUTHORIZED` are intentionally supported; prefer config changes over hardcoding tokens.
- When adding new dependencies, ensure they are added to `package.json` and usage fits ESM. Use exact versions as per existing dependencies.
- Keep `package.json` sorted alphabetically in `dependencies` and `devDependencies`.
- Follow existing style: minimal new inline comments, keep utility functions small, and do not rework CI/test harnesses unless requested.

Debugging notes
- To reproduce the runtime locally, create a `~/.gitlab-radiator.yml` with at least one `gitlabs` entry with `url` and `access-token` (or set `GITLAB_ACCESS_TOKEN`).
- Logs and errors are printed on the server console; network timeouts are 30s in `src/gitlab/client.ts`.
- Dev mode: `src/dev-assets.ts` is loaded when `NODE_ENV !== 'production'` and `./src/dev-assets.ts` exists — use it to bind webpack dev middleware for frontend HMR.

When to ask for human guidance
- Any change that modifies the `state` emitted to clients, the YAML config schema, or the HTTP endpoints should be flagged for review.
- Changes touching authentication flows or handling of GitLab tokens/CA files should be reviewed for security implications.

References
- See `src/app.ts`, `src/config.ts`, `src/gitlab/*`, and `src/client/*` as primary examples of the runtime and data flow.
