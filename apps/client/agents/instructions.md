# Client App Instructions

## Scope

- These rules apply only to `apps/client`.
- These rules override generic repo guidance for frontend work.
- Keep changes aligned with the existing React + TypeScript + Vite setup.
- Prefer patterns already used in this app over introducing new abstractions.

## General Frontend Principles

- These rules override generic repo guidance for frontend work.
- The agent should always consult it before making client changes.
- Keep UI code simple, readable, and component-driven.
- Prefer functional components and hooks.
- Make the smallest change that solves the task.
- Avoid unrelated refactors unless they are required for the requested work.

## Project Structure

- Follow the existing folder structure under `src/`.
- Place UI components in `components/`, page-level views in `pages/`, routing in `router/`, shared logic in `hooks/`, and client state in `stores/`.
- Keep feature-specific logic close to the feature when that improves clarity.

## TypeScript

- Use explicit types when they improve maintainability.
- Avoid `any` unless there is no practical alternative.
- Prefer shared types from `src/types/` or `packages/shared` when appropriate.
- Keep generated or API-derived types consistent with the backend contract.

## API and Data Fetching

- Use the existing API client patterns in `src/api/`.
- Prefer React Query for async server state when the task involves fetching, caching, or mutation workflows.
- Keep request logic out of presentational components when possible.
- Handle loading, error, and empty states explicitly.

## State Management

- Use the existing store patterns already present in `src/stores/`.
- Keep local component state for UI-only concerns.
- Do not introduce a global store unless the feature truly needs shared client state.

## Routing and Auth

- Keep routing changes in `src/router/`.
- Preserve the app’s auth flow and route protection patterns.
- When adding new pages, ensure route access and navigation are updated together.

## UI and Styling

- Reuse existing components and styles before creating new ones.
- Keep CSS modules scoped to the relevant component when practical.
- Preserve the current visual language, spacing, and layout structure.
- Avoid adding new UI libraries unless specifically required.

## Forms and Validation

- Keep form logic predictable and easy to follow.
- Validate user input close to where the form is handled.
- Show clear feedback for invalid input and failed requests.

## Internationalization

- Add or update strings in the i18n files when user-facing text changes.
- Avoid hardcoding user-visible text in components when the app already has translations for that area.

## Accessibility

- Use semantic HTML where possible.
- Ensure interactive elements are keyboard accessible.
- Provide labels, alt text, and visible focus states where needed.

## Testing and Quality

- Add or update tests when behavior changes.
- Keep components and hooks easy to test (e.g., clear inputs/outputs, minimal hidden state).
- Prefer tests that cover user-visible behavior and important logic.
- When adding tests for this app, use the repo’s agreed tooling (Vitest).

## Before Finishing

- Check TypeScript, linting, and any relevant app-specific validation.
- Keep imports clean and consistent.
- Remove dead code, but avoid cleanup that is unrelated to the task.
