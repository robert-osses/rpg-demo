# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Fixed
- TypeScript build errors: corrected `vite.config.ts` to import `defineConfig` from `vitest/config` so the `test` property is recognized
- Missing required `class` field in `CharacterData` and `EnemyData` mock objects in combat unit tests
- Unused private property `envObjects` in `SceneManager` that caused a TypeScript lint error

---

## [0.1.0] - 2026-02-23

### Added
- Initial RPG Battle Simulator project setup with React 19, Three.js, TypeScript and Vite
- Core combat engine: turn queue, damage calculator, combat state machine
- Three.js renderer with procedural fantasy backgrounds (forest, cave, dark themes)
- Character and enemy selection screens with class portraits and labels
- Supabase integration for character and enemy data persistence
- Vitest unit test suite covering combat logic, damage calculation, and turn queue
- `class` field added to `CharacterData` and `EnemyData` database types
