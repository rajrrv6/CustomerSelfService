# Local Development Workflow

This document details the branch management conventions, commit formatting, test validation pipelines, database seeding processes, and coding disciplines.

---

## 1. Branch Naming & Commit Rules

### Branch Naming Conventions
- `feature/[module-name]-[short-desc]`: For new feature code (e.g. `feature/auth-otp-wizard`).
- `bugfix/[module-name]-[desc]`: For bug fixes (e.g. `bugfix/chat-typing-throttle`).
- `docs/[desc]`: For documentation updates (e.g. `docs/openapi-endpoints`).

### Commit Message Formatting
Commit messages must follow the **Conventional Commits** standard:

```text
type(module): short description
```

- **Types**:
  - `feat`: A new feature api endpoint or module class.
  - `fix`: A bug fix.
  - `docs`: Documentation modifications.
  - `style`: Formatting or whitespace changes (no code edits).
  - `refactor`: Structural code cleanup (no behavior changes).
  - `test`: Adding or refining test suites.
- **Example**: `feat(auth): add TOTP step-up verification challenge`

---

## 2. Checkpoint-Driven Development Process
For every task or user story:
1. **Design First**: Verify the architecture plan or document is updated under `docs/`.
2. **Setup task.md Checklist**: Mark the task as `[/]` (in progress) in `task.md`.
3. **Write Tests**: Write unit/integration specifications.
4. **Implement Code**: Build code changes in small, reviewable commits.
5. **Run Checks**: Run typechecks, lint passes, and test runs locally.
6. **Submit Checkpoint**: Create a checkpoint report in `docs/checkpoints/` detailing validation outcomes.
7. **Mark task.md Complete**: Set task checklist status to `[x]`.

---

## 3. Database Migration & Seed Policy

### 1. Schema Modifications
- Schema modifications must happen via Mongoose version increments or schema evolution notes.
- Do not make breaking edits to fields that have existing production data without a three-phase rollout plan (described in `api_standards_contracts.md`).

### 2. Seeding Development Data
- Local development databases are seeded using the `npm run seed` command.
- The seed script is deterministic (using stable IDs) and clears the collections before writing to avoid duplicate primary key collisions.
- **Mock Leak Block**: Production configurations must check `NODE_ENV !== 'production'` before executing the seed runner.