# Changelog

All notable changes to the FE are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-04-01

### Added

- Office management: list all offices with their hours, staff, and specialization
- Create and edit offices via a modal with office hours per day and role-filtered staff assignment
- Admin-only "Offices" entry in the side navigation menu
- Office, user, and common error code translation keys in EN and CS locales
- Day/time short labels and form validation keys in both locales
- `useGetOfficesQuery`, `useGetOfficeDetailQuery`, `useCreateOfficeMutation`, `useUpdateOfficeMutation` service hooks
- `useGetUsersQuery` hook with role filtering

### Changed

- `DataTable`: added `column.style` prop, configurable `highlightOnHover`, updated i18n key paths
- Side menu navigation labels are now translated via i18n
- `client.ts` renamed to `clientService.ts` for consistency
- All Mantine packages aligned to `^8.3.18`
- `TranslationKeys` type now uses `DeepString<T>` to enforce translation completeness at compile time

## [0.3.0] - 2026-03-18

### Added

- Split view of side menu and app content
- Separation of concerns for the login and the app content
- Navigating to the login route now logs out the user
- TanStack Query integration (POC)

## [0.2.0] - 2026-03-14

### Added

- Login + create account UI and flow
- Authorization support with role-based access control
- Redirect to `/forbidden` page when user lacks the required role

## [0.1.0] - 2026-03-11

### Added

- Initial frontend setup

## [0.0.1] - 2026-03-09

### Added

- Initial project setup
