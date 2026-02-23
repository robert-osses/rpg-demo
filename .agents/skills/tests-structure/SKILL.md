---
name: tests-structure
description: Defines conventions for unit tests and component tests using Vitest and React Testing Library.
---

## Instructions
1. Place test files next to implementation (`*.test.ts`).
2. Use mocks for domain logic when testing UI.
3. Assert expected state transitions in core logic.
4. Add coverage thresholds in config (e.g., ≥80%).
5. Set up test commands in CI workflow.

## Tools
- Vitest for JS/TS logic.
- RTL for React component validation.