---
name: gameplay-core
description: Defines core turn-based RPG mechanics including turn order, damage calculation, state effects, and combat resolution.
---

## Overview
This skill encapsulates the logic for the classic turn-based RPG battle system used in Antigravity.

## Instructions
1. Define a `CombatState` that tracks players, enemies, turn queue, and effects.
2. For each turn, calculate initiative based on speed stat.
3. Apply action effects (damage, heal, buffs/debuffs) and update state.
4. Resolve end-of-turn effects (regen, poison).
5. Return updated `CombatState`.

## Edge Cases
- Overkill damage clamping.
- Ability cooldowns not reset.