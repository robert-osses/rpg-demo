---
name: changelog-management
description: Defines how to maintain and update CHANGELOG.md in the Antigravity project using Keep a Changelog and Semantic Versioning.
---

# Overview

This skill defines how to maintain a structured, readable, and professional CHANGELOG.md.

The changelog must reflect user-visible changes only.

Internal refactors without behavior change do not belong unless impactful.

---

# Changelog Format Standard

Follow "Keep a Changelog" format.

File: CHANGELOG.md

Structure:

# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog.
This project adheres to Semantic Versioning.

---

## [Unreleased]

### Added
### Changed
### Fixed
### Removed

---

## [0.1.0] - YYYY-MM-DD

### Added
- Initial combat engine
- Three.js renderer bootstrap
- Local storage persistence

---

# Rules for Updating

1. Every feature commit must be reflected under [Unreleased].
2. Group entries by category.
3. Keep entries concise.
4. Write from user/system perspective.
5. Do not copy raw commit messages.
6. Move [Unreleased] into a version section when tagging.

---

# Categories

Added      → new feature
Changed    → behavior modification
Fixed      → bug fix
Removed    → deleted feature
Security   → security fix (if ever needed)

---

# Versioning Strategy

0.x → Development phase
1.0.0 → First stable playable release

Patch increment:
Bug fixes only

Minor increment:
New features, backward compatible

Major increment:
Breaking changes

---

# Release Workflow

1. Ensure tests pass.
2. Move Unreleased changes under new version header.
3. Add release date.
4. Commit:
   chore(release): prepare vX.X.X
5. Tag version.
6. Push tag.

---

# Example Entry

## [0.2.0] - 2026-02-15

### Added
- Status effect system (poison, stun)
- Damage calculation with modifiers

### Fixed
- Turn skipping when enemy HP reaches zero

---

# Anti-Patterns

- Dumping raw commit messages
- Writing paragraphs instead of bullet points
- Mixing internal-only changes
- Skipping release date