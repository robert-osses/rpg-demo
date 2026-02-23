---
name: action-selection-ui
description: Provides steps to implement user interaction for choosing actions (attack, item, defend) in React.
---

## Overview
Instructions for building the turn-based action panel.

## Steps
1. Present available actions as buttons.
2. When action is clicked, validate input.
3. Emit an event to the game core with action ID and target.
4. Disable input until next turn begins.

## Common Patterns
- Debounce rapid clicks to prevent race conditions.
- Accessibility focus on keyboard navigation.