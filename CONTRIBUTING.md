# Contributing

Thanks for contributing to this monorepo.

## Branching model

- Branch from `main` using a feature branch:
  - `feature/<short-description>`
  - `fix/<short-description>`
  - `chore/<short-description>`
- Keep branches focused on a single change.

## Commit messages

Use Conventional Commits where possible:

- `feat: add portfolio endpoint`
- `fix: handle missing ticker in service`
- `chore: update lint tooling`
- `docs: clarify local setup`

Format:

```text
<type>(optional-scope): short imperative summary
```

## Development standards

### Coding standards

- Prefer clear, small, composable functions.
- Keep behavior changes separate from tooling/docs updates when possible.
- Add or update tests with code changes that affect logic.

### Naming conventions

- **TypeScript/React**: components in `PascalCase`, variables/functions in `camelCase`, constants in `UPPER_SNAKE_CASE`.
- **Python**: modules/functions/variables in `snake_case`, classes in `PascalCase`, constants in `UPPER_SNAKE_CASE`.

### Error handling conventions

- **Frontend**: surface user-friendly error messages and preserve server-provided details when available.
- **Backend**: raise domain/service errors with actionable messages; convert to stable API error responses in the FastAPI layer.

## Run checks locally

From repo root:

```bash
make format
make lint
make typecheck
make test
make check
```

You can also run workspace-specific checks:

```bash
cd frontend && npm run lint && npm run format:check
cd backend && ruff check app tests && black --check app tests && mypy app tests && pytest
```

## Pull request checklist

Before opening a PR:

- [ ] Rebased/merged latest `main`.
- [ ] `make check` passes locally.
- [ ] Added/updated tests for behavior changes.
- [ ] Updated docs (README/CONTRIBUTING) if workflows changed.
- [ ] Included screenshots for UI changes.
- [ ] PR description clearly states what changed and why.
