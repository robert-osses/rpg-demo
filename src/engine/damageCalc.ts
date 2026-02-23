import type { CombatUnit } from './types';

/**
 * Seeded random number generator for reproducibility in tests.
 * Uses a simple LCG (Linear Congruential Generator).
 */
let _seed = Date.now();

export function setSeed(seed: number): void {
    _seed = seed;
}

function seededRandom(): number {
    _seed = (_seed * 1664525 + 1013904223) % 4294967296;
    return _seed / 4294967296;
}

/**
 * Random variation factor: returns value between 0.9 and 1.1
 */
export function randomVariation(): number {
    return 0.9 + seededRandom() * 0.2;
}

/**
 * Calculate physical attack damage.
 * Formula: max(1, (attacker.atk - defender.def / 2)) * variation
 * If defender is defending, damage is halved.
 */
export function calculateDamage(
    attacker: CombatUnit,
    defender: CombatUnit
): number {
    const isDefending = defender.statusEffects.some(
        (e) => e.type === 'defending'
    );
    const effectiveAtk = attacker.atk;
    const effectiveDef = defender.def;

    let damage = Math.max(1, effectiveAtk - effectiveDef / 2);
    damage = Math.floor(damage * randomVariation());

    if (isDefending) {
        damage = Math.floor(damage * 0.5);
    }

    return Math.max(1, damage);
}

/**
 * Calculate magic ability damage.
 * Formula: max(1, power + attacker.atk * 0.3 - defender.def * 0.2) * variation
 */
export function calculateMagicDamage(
    attacker: CombatUnit,
    defender: CombatUnit,
    power: number
): number {
    const isDefending = defender.statusEffects.some(
        (e) => e.type === 'defending'
    );

    let damage = Math.max(
        1,
        power + attacker.atk * 0.3 - defender.def * 0.2
    );
    damage = Math.floor(damage * randomVariation());

    if (isDefending) {
        damage = Math.floor(damage * 0.5);
    }

    return Math.max(1, damage);
}

/**
 * Calculate healing amount from an ability.
 * Formula: power * (1 + variation * 0.1)
 */
export function calculateHeal(power: number): number {
    return Math.floor(power * randomVariation());
}
