import { describe, it, expect } from 'vitest';
import { buildTurnQueue, getCurrentUnitId, advanceTurn } from './turnQueue';
import type { CombatUnit } from './types';

function makeUnit(partial: Partial<CombatUnit> & { id: string; spd: number }): CombatUnit {
    return {
        name: partial.id,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        atk: 20,
        def: 10,
        baseatk: 20,
        basedef: 10,
        isPlayer: true,
        isAlive: true,
        spriteColor: '#fff',
        spriteShape: 'box',
        abilities: [],
        statusEffects: [],
        ...partial,
    };
}

describe('turnQueue', () => {
    describe('buildTurnQueue', () => {
        it('sorts units by speed descending', () => {
            const units = [
                makeUnit({ id: 'slow', spd: 5 }),
                makeUnit({ id: 'fast', spd: 30 }),
                makeUnit({ id: 'mid', spd: 15 }),
            ];
            const queue = buildTurnQueue(units);
            expect(queue).toEqual(['fast', 'mid', 'slow']);
        });

        it('excludes dead units', () => {
            const units = [
                makeUnit({ id: 'alive', spd: 10 }),
                makeUnit({ id: 'dead', spd: 20, isAlive: false }),
            ];
            const queue = buildTurnQueue(units);
            expect(queue).toEqual(['alive']);
        });

        it('returns empty for all dead units', () => {
            const units = [
                makeUnit({ id: 'dead1', spd: 10, isAlive: false }),
                makeUnit({ id: 'dead2', spd: 20, isAlive: false }),
            ];
            expect(buildTurnQueue(units)).toEqual([]);
        });
    });

    describe('getCurrentUnitId', () => {
        it('returns the current unit ID', () => {
            expect(getCurrentUnitId(['a', 'b', 'c'], 0)).toBe('a');
            expect(getCurrentUnitId(['a', 'b', 'c'], 1)).toBe('b');
            expect(getCurrentUnitId(['a', 'b', 'c'], 2)).toBe('c');
        });

        it('returns null for empty queue', () => {
            expect(getCurrentUnitId([], 0)).toBeNull();
        });
    });

    describe('advanceTurn', () => {
        it('advances to next index', () => {
            const units = [
                makeUnit({ id: 'a', spd: 30 }),
                makeUnit({ id: 'b', spd: 20 }),
            ];
            const result = advanceTurn(units, ['a', 'b'], 0);
            expect(result.currentTurnIndex).toBe(1);
            expect(result.newRound).toBe(false);
        });

        it('rebuilds queue at end of round', () => {
            const units = [
                makeUnit({ id: 'a', spd: 30 }),
                makeUnit({ id: 'b', spd: 20 }),
            ];
            const result = advanceTurn(units, ['a', 'b'], 1);
            expect(result.currentTurnIndex).toBe(0);
            expect(result.newRound).toBe(true);
        });

        it('skips dead units', () => {
            const units = [
                makeUnit({ id: 'a', spd: 30 }),
                makeUnit({ id: 'b', spd: 20, isAlive: false }),
                makeUnit({ id: 'c', spd: 10 }),
            ];
            const result = advanceTurn(units, ['a', 'b', 'c'], 0);
            expect(result.currentTurnIndex).toBe(2);
        });
    });
});
