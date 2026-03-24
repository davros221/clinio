# Update Changelog

Update the changelog and bump the version for the server app.

## Instructions

1. Analyze changes in `apps/server/` using `git diff origin/master...HEAD -- apps/server/`.
2. Read the current `apps/server/CHANGELOG.md` and `apps/server/package.json`.
3. Determine the appropriate version bump:
   - **Patch** (0.0.x): bug fixes, minor tweaks
   - **Minor** (0.x.0): new features, new endpoints, new modules
   - **Major** (x.0.0): breaking changes to existing API contracts
4. Bump the `version` field in `apps/server/package.json`.
5. Add a new entry at the top of the changelog (below the header) following the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.
   Use section headers as appropriate: Added, Changed, Deprecated, Removed, Fixed, Security.
6. Use today's date for the new entry.
7. Write concise, human-readable descriptions. Do NOT list individual file changes — summarize the user-facing or developer-facing impact.
8. Do NOT modify anything outside of `apps/server/`.
9. Commit with message: `chore(server): update changelog and bump version to <new_version>`

## Example changelog entry

```markdown
## [0.2.0] - 2026-03-19

### Added

- Calendar module with CRUD endpoints for appointments
- JWT-based authentication with role-based access control

### Fixed

- User creation endpoint now validates email format
```
