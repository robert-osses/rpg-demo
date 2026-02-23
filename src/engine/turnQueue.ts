import type { CombatUnit } from './types';

/**
 * Builds the turn queue ordered by speed (highest first).
 * Returns an array of unit IDs.
 */
export function buildTurnQueue(units: CombatUnit[]): string[] {
    return units
        .filter((u) => u.isAlive)
        .sort((a, b) => b.spd - a.spd)
        .map((u) => u.id);
}

/**
 * Gets the ID of the unit whose turn it is.
 */
export function getCurrentUnitId(
    turnQueue: string[],
    currentTurnIndex: number
): string | null {
    if (turnQueue.length === 0) return null;
    return turnQueue[currentTurnIndex % turnQueue.length] ?? null;
}

/**
 * Advances to the next turn index. Rebuilds queue at start of new round.
 */
export function advanceTurn(
    units: CombatUnit[],
    turnQueue: string[],
    currentTurnIndex: number
): { turnQueue: string[]; currentTurnIndex: number; newRound: boolean } {
    const nextIndex = currentTurnIndex + 1;

    if (nextIndex >= turnQueue.length) {
        // New round: rebuild queue with alive units
        const newQueue = buildTurnQueue(units);
        return { turnQueue: newQueue, currentTurnIndex: 0, newRound: true };
    }

    // Skip dead units
    const nextId = turnQueue[nextIndex];
    const nextUnit = units.find((u) => u.id === nextId);
    if (nextUnit && !nextUnit.isAlive) {
        return advanceTurn(units, turnQueue, nextIndex);
    }

    return { turnQueue, currentTurnIndex: nextIndex, newRound: false };
}
