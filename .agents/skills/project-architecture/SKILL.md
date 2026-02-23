---
name: project-architecture
description: Defines the architectural patterns, programming language standards, and framework decisions for the Antigravity turn-based RPG project.
---

# Overview

This skill formalizes the technical foundation of the Antigravity project.

It defines:
- Architecture pattern
- Programming language
- Framework decisions
- Layer separation rules
- Technical constraints
- Anti-patterns to avoid

This skill must be consulted before implementing any feature.

---

# Technology Stack

Language:
TypeScript (strict mode enabled)

Frontend Framework:
React

3D Engine:
Three.js (direct integration, not React Three Fiber)

Build Tool:
Vite

Testing:
Vitest + React Testing Library

Deployment:
Vercel

Version Control:
Git + GitHub

---

# Architectural Pattern

Pattern:
Layered Clean Architecture (UI → Adapter → Core → Infra)

Structure:

UI Layer (React)
  ↓
Application Adapter Layer
  ↓
Domain/Core Layer (Game Engine)
  ↓
Infrastructure Layer (Storage, Config, Logging)

---

# Core Principles

1. The Game Engine must not depend on React.
2. The Game Engine must not depend on Three.js.
3. Three.js must only render derived state.
4. All combat logic must be pure and testable.
5. Side effects must be isolated to Infra layer.
6. State mutations must be controlled and predictable.

---

# Layer Responsibilities

## UI Layer

- Menus
- Action selection
- HUD
- Event dispatch

Must not contain combat logic.

---

## Adapter Layer

- Translates UI events into engine commands.
- Maps engine state into renderable data.

---

## Domain/Core Layer

- Turn order logic
- Damage calculation
- Status effects
- Victory conditions
- RNG handling

Must be 100% unit testable.

---

## Infrastructure Layer

- localStorage persistence
- Config loading
- Logging utilities

No business rules allowed.

---

# File Structure Standard

src/
  app/
  ui/
  engine/
  renderer/
  infra/
  tests/

---

# Dependency Rules

Allowed:

UI → Engine
UI → Renderer
Engine → Nothing
Renderer → Engine (read-only)
Infra → Nothing

Forbidden:

Engine → React
Engine → Three.js
Renderer → Modify engine state directly
UI → Modify engine state without adapter

---

# Coding Standards

- Strict TypeScript
- No implicit any
- No global mutable state
- No business logic inside React components
- No logic inside Three.js animation loop beyond rendering

---

# Anti-Patterns

❌ Mixing combat logic inside React components  
❌ Using Three.js objects as source of truth  
❌ Storing game state inside local component state  
❌ Mutating state without controlled transition  
❌ Large monolithic files  

---

# Decision Log

Three.js direct is chosen over React Three Fiber for:
- Full render control
- Reduced abstraction
- Clear separation between engine and UI

RPG turn-based design removes need for ECS.

Physics engines are not required at initial stage.