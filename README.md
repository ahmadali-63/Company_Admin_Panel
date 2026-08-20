# Company Admin Panel — API

TypeScript / Express 5 / Mongoose 9, ESM.

## Quick start

```bash
cp .env.example .env      # then fill in real values
npm install
npm run seed              # creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev               # tsx watch, http://localhost:5000
```

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | `tsx watch src/server.ts`                      |
| `npm run build`     | `tsc` → `dist/`                                |
| `npm start`         | `node dist/server.js`                          |
| `npm run typecheck` | type-checks `src/` **and** `tests/`            |
| `npm test`          | vitest + supertest against in-memory MongoDB   |
| `npm run seed`      | idempotent admin seed (dev)                    |
| `npm run seed:prod` | same, from `dist/`                             |

## Layout

Feature-first. Everything one feature needs sits in one folder, so adding a
feature means adding a folder and one line in `src/routes.ts` — not editing six
sibling directories.

```
src/
  server.ts              listen + graceful shutdown; the only file that binds a port
  app.ts                 builds the Express app (tests import this directly)
  routes.ts              mounts every module under /api
  config/
    env.ts               zod-validated process.env; exits at boot if invalid
    db.ts                connect / disconnect
    logger.ts            pino
  common/
    constants/           roles, statuses, response messages
    errors/              AppError + typed subclasses
    middleware/          authenticate, authorize, validate, errorHandler,
                         rateLimit, requestLogger
    schemas/             shared zod pieces (objectId, pagination)
    types/               express augmentation, auth types, db type aliases
    utils/               asyncHandler, pagination, objectId helpers
  modules/
    auth/    project/    task/    user/    stats/
  scripts/
    seedAdmin.ts
tests/                   supertest suites + in-memory Mongo setup
```

### The layer rule

```
routes  →  controller  →  service  →  repository  →  model
```

- **routes** — path, guards, zod schema. No logic.
- **controller** — reads the request, calls one service method, shapes the HTTP
  response. No business rules, no database access.
- **service** — all business rules and authorization decisions. Throws
  `AppError` subclasses; never touches `req` or `res`.
- **repository** — all queries. Owns projection, `populate`, `lean`. Services
  never import a model directly.
- **model** — schema, indexes, hooks.

Two rules keep this from rotting:

1. A layer may only call the layer directly below it.
2. Cross-module calls go **service → other module's repository**, never
   service → service. (`stats.service` and `task.service` import
   `buildProjectScopeFilter` as a pure function, which is fine — it takes no
   dependencies.)

### Adding a feature

```
src/modules/leave/
  leave.model.ts       schema + indexes
  leave.repository.ts  queries
  leave.service.ts     rules
  leave.controller.ts  request/response
  leave.routes.ts      paths + guards + validate()
  leave.schema.ts      zod input types
```

Then `apiRouter.use("/leave", leaveRoutes)` in `src/routes.ts`. Nothing else
changes.

## Auth

Access token (`Authorization: Bearer …`) plus a rotating refresh token.

| Endpoint                    | Notes                                              |
| --------------------------- | -------------------------------------------------- |
| `POST /api/auth/login`      | returns `token`, `refreshToken`, `user`             |
| `POST /api/auth/signup`     | always creates a `team_member` — role is not accepted from the body |
| `POST /api/auth/register`   | alias of signup                                     |
| `POST /api/auth/refresh`    | rotates: the presented refresh token dies           |
| `POST /api/auth/logout`     | bumps `tokenVersion`, killing every refresh token   |
| `POST /api/auth/change-password` | also bumps `tokenVersion`                      |
| `GET  /api/auth/me`         | returns the caller                                  |

Refresh tokens carry the user's `tokenVersion` in their `jti`. Bumping that
column — on logout, password change, or deactivation — invalidates every token
already issued, with no server-side session store.

## Authorization

Two independent gates:

- **Role gate** (`authorize(...)` in the route) — coarse: may this role touch
  this endpoint at all?
- **Row scope** (in the service) — fine: does this specific record fall inside
  the caller's slice?

| Role          | Users visible          | Projects visible      | Tasks visible                          |
| ------------- | ---------------------- | --------------------- | -------------------------------------- |
| `admin`       | all                    | all                   | all                                    |
| `hr`          | self + direct reports  | where `hrIds` has them | in their projects, or created by them  |
| `team_lead`   | self + their members   | where `teamLeadIds` has them | in their projects, assigned, or created |
| `team_member` | self                   | where `memberIds` has them | assigned to them only              |

## Validation

Every route runs `validate({ params, query, body })` with a zod schema.
Controllers receive parsed, coerced, trimmed values. Parsed query lands on
`res.locals.query` (Express 5 makes `req.query` read-only) — read it with
`validatedQuery<T>(res)`.

## Pagination

Opt-in, so existing callers are unaffected: no `page`/`limit` returns the full
set. Supplying either switches to paged mode (max 200/page). List responses
always carry `count`, the array, and a `pagination` object.

## Response shape

Unchanged from the JavaScript version — the existing React client needs no edits.

```jsonc
{ "success": true, "message": "…", "user": {} }            // single
{ "success": true, "count": 12, "users": [], "pagination": {} }  // list
{ "success": false, "message": "…", "errors": ["…"] }      // failure
```

## Environment

`src/config/env.ts` validates the environment at boot and **exits** if it is
wrong, so a missing secret is a startup failure rather than a 500 in
production. See `.env.example` for the full list.

`JWT_SECRET` and `JWT_REFRESH_SECRET` must be ≥32 characters and different from
each other:

```bash
openssl rand -base64 48
```

## Testing

`npm test` boots an in-memory MongoDB (`mongodb-memory-server`), imports
`createApp()` directly, and drives it with supertest. No running database
needed. Collections are truncated between tests; the first run downloads a
Mongo binary.

## Operational notes

- `GET /health` reports DB connectivity and returns 503 when it is down.
- `SIGTERM`/`SIGINT` drain in-flight requests, then close Mongo (10s hard cap).
- Every response carries `x-request-id`; logs are JSON in production and
  pretty-printed in development, with auth headers and passwords redacted.
- `Dockerfile` is a three-stage build that runs as the `node` user.
