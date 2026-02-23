import { describe, it, expect } from 'vitest';
import { calculateDamage, calculateMagicDamage, calculateHeal } from './damageCalc';
import type { CombatUnit } from './types';

function makeUnit(partial: Partial<CombatUnit>): CombatUnit {
    return {
        id: 'unit',
        name: 'Unit',
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        atk: 20,
        def: 10,
        spd: 10,
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

describe('damageCalc', () => {
    describe('calculateDamage', () => {
        it('calculates positive damage', () => {
            const attacker = makeUnit({ atk: 30 });
            const defender = makeUnit({ def: 10 });
            const dmg = calculateDamage(attacker, defender);
            expect(dmg).toBeGreaterThan(0);
        });

        it('always does at least 1 damage', () => {
            const attacker = makeUnit({ atk: 1 });
            const defender = makeUnit({ def: 100 });
            const dmg = calculateDamage(attacker, defender);
            expect(dmg).toBeGreaterThanOrEqual(1);
        });

        it('halves damage when defender is defending', () => {
            const attacker = makeUnit({ atk: 40 });
            const defenderNormal = makeUnit({ def: 10 });
            const defenderGuard = makeUnit({
                def: 10,
                statusEffects: [
                    { id: 'def', name: 'Defending', type: 'defending', value: 0, turnsRemaining: 1 },
                ],
            });

            // Run multiple times to ensure statistical tendency
            let normalTotal = 0;
            let guardTotal = 0;
            const runs = 100;

            for (let i = 0; i < runs; i++) {
                normalTotal += calculateDamage(attacker, defenderNormal);
                guardTotal += calculateDamage(attacker, defenderGuard);
            }

            expect(guardTotal / runs).toBeLessThan(normalTotal / runs);
        });
    });

    describe('calculateMagicDamage', () => {
        it('uses ability power in damage calculation', () => {
            const attacker = makeUnit({ atk: 20 });
            const defender = makeUnit({ def: 10 });
            const dmg = calculateMagicDamage(attacker, defender, 35);
            expect(dmg).toBeGreaterThan(0);
        });

        it('always does at least 1 magic damage', () => {
            const attacker = makeUnit({ atk: 1 });
            const defender = makeUnit({ def: 100 });
            const dmg = calculateMagicDamage(attacker, defender, 1);
            expect(dmg).toBeGreaterThanOrEqual(1);
        });
    });

    describe('calculateHeal', () => {
        it('heals based on power', () => {
            const heal = calculateHeal(40);
            expect(heal).toBeGreaterThan(0);
            expect(heal).toBeLessThanOrEqual(50); // Max with 10% variation
        });
    });
});
