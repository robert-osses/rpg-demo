---
name: commit-writing
description: Defines the standard for writing consistent, semantic, and traceable commits in the Antigravity project using Conventional Commits and single-developer workflow best practices.
---

# Overview

This skill enforces a clear, professional commit history using Conventional Commits and a single-developer branching strategy.

The goal is:
- Traceability
- Readability
- Automated changelog compatibility
- Clean Git history
- Version clarity

---

# Commit Format Standard

Use Conventional Commits format:

<type>(optional-scope): short description

Examples:

feat(combat): add turn queue system
fix(renderer): dispose geometries on unmount
refactor(engine): extract damage calculator
test(core): add unit tests for status effects
docs(readme): update project architecture
chore(ci): add vitest to pipeline

---

# Allowed Types

feat        → new feature
fix         → bug fix
refactor    → code restructuring without behavior change
test        → add or modify tests
docs        → documentation changes
chore       → tooling, config, CI
perf        → performance improvement
style       → formatting changes only

Do NOT invent new types.

---

# Rules

1. Use present tense.
2. Keep subject line under 72 characters.
3. Do not end with a period.
4. Be specific.
5. One logical change per commit.
6. Never mix refactor + feature in same commit.
7. All commits must pass lint + tests before pushing.

---

# Scope Guidelines

Use scope when modifying a specific module:

engine
combat
renderer
ui
storage
ci
tests
config

Example:

feat(storage): implement localStorage persistence

---

# Bad Examples

fix: stuff
update code
changed some files
feat: update

---

# Good Examples

feat(combat): implement turn order calculation
fix(engine): prevent negative HP overflow
refactor(renderer): isolate scene bootstrap logic
test(combat): validate poison damage tick logic

---

# Workflow (Single Developer)

1. Create feature branch:
   feature/<short-name>

2. Make atomic commits.

3. Merge into main via PR (even if solo).

4. Delete feature branch after merge.

---

# Release Tagging

When a version is ready:

git tag v0.1.0
git push origin v0.1.0

Tags must follow SemVer:

MAJOR.MINOR.PATCH

0.x phase = experimental development stage.