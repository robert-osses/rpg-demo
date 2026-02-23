import type { CombatUnit, CombatAction, Ability } from './types';

/**
 * Basic enemy AI: randomly selects an action and a target.
 */
export function decideEnemyAction(
    unit: CombatUnit,
    playerUnits: CombatUnit[],
    enemyUnits: CombatUnit[]
): CombatAction {
    const alivePlayerUnits = playerUnits.filter((u) => u.isAlive);
    const aliveEnemyUnits = enemyUnits.filter((u) => u.isAlive);

    if (alivePlayerUnits.length === 0) {
        // No valid targets, defend
        return { type: 'defend', sourceId: unit.id, targetIds: [unit.id] };
    }

    const usableAbilities = unit.abilities.filter((a) => a.mpCost <= unit.mp);
    const aiType = unit.aiType ?? 'basic';

    // Aggressive AI: 70% chance to use ability if available, 30% basic attack
    // Defensive AI: 40% chance to defend, 30% attack, 30% ability
    // Basic AI: equal chance for all available actions

    const roll = Math.random();

    if (aiType === 'aggressive') {
        if (usableAbilities.length > 0 && roll < 0.7) {
            return buildMagicAction(unit, usableAbilities, alivePlayerUnits, aliveEnemyUnits);
        }
        return buildAttackAction(unit, alivePlayerUnits);
    }

    if (aiType === 'defensive') {
        if (roll < 0.4) {
            return { type: 'defend', sourceId: unit.id, targetIds: [unit.id] };
        }
        if (usableAbilities.length > 0 && roll < 0.7) {
            return buildMagicAction(unit, usableAbilities, alivePlayerUnits, aliveEnemyUnits);
        }
        return buildAttackAction(unit, alivePlayerUnits);
    }

    // Basic AI
    const options: ActionType[] = ['attack'];
    if (usableAbilities.length > 0) options.push('magic');
    options.push('defend');

    type ActionType = 'attack' | 'magic' | 'defend';
    const chosen = options[Math.floor(Math.random() * options.length)];

    if (chosen === 'defend') {
        return { type: 'defend', sourceId: unit.id, targetIds: [unit.id] };
    }
    if (chosen === 'magic') {
        return buildMagicAction(unit, usableAbilities, alivePlayerUnits, aliveEnemyUnits);
    }
    return buildAttackAction(unit, alivePlayerUnits);
}

function buildAttackAction(unit: CombatUnit, targets: CombatUnit[]): CombatAction {
    const target = targets[Math.floor(Math.random() * targets.length)];
    return {
        type: 'attack',
        sourceId: unit.id,
        targetIds: [target.id],
    };
}

function buildMagicAction(
    unit: CombatUnit,
    abilities: Ability[],
    playerTargets: CombatUnit[],
    _enemyTargets: CombatUnit[]
): CombatAction {
    const ability = abilities[Math.floor(Math.random() * abilities.length)];
    let targetIds: string[];

    switch (ability.targetType) {
        case 'all_enemies':
            // From enemy's perspective, "enemies" are the player's units
            targetIds = playerTargets.map((u) => u.id);
            break;
        case 'single_enemy':
            targetIds = [playerTargets[Math.floor(Math.random() * playerTargets.length)].id];
            break;
        case 'single_ally':
            targetIds = [_enemyTargets[Math.floor(Math.random() * _enemyTargets.length)].id];
            break;
        case 'all_allies':
            targetIds = _enemyTargets.map((u) => u.id);
            break;
        case 'self':
            targetIds = [unit.id];
            break;
        default:
            targetIds = [playerTargets[Math.floor(Math.random() * playerTargets.length)].id];
    }

    return {
        type: 'magic',
        sourceId: unit.id,
        targetIds,
        abilityId: ability.id,
    };
}
