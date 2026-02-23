import type {
    CombatState,
    CombatAction,
    CombatUnit,
    TurnResult,
    Ability,
    Item,
    StatusEffect,
} from './types';
import { calculateDamage, calculateMagicDamage, calculateHeal } from './damageCalc';

/**
 * Creates a deep clone of the combat state to maintain immutability.
 */
function cloneState(state: CombatState): CombatState {
    return JSON.parse(JSON.stringify(state)) as CombatState;
}

function findUnit(units: CombatUnit[], id: string): CombatUnit | undefined {
    return units.find((u) => u.id === id);
}

function applyDamage(unit: CombatUnit, amount: number): void {
    unit.hp = Math.max(0, unit.hp - amount);
    if (unit.hp === 0) {
        unit.isAlive = false;
    }
}

function applyHeal(unit: CombatUnit, amount: number): void {
    unit.hp = Math.min(unit.maxHp, unit.hp + amount);
    if (unit.hp > 0) {
        unit.isAlive = true;
    }
}

// ---- Execute Attack ----

export function executeAttack(
    state: CombatState,
    action: CombatAction
): { state: CombatState; result: TurnResult } {
    const newState = cloneState(state);
    const source = findUnit(newState.units, action.sourceId);
    if (!source || !source.isAlive) {
        return { state: newState, result: { action, damages: [], messages: ['Unit cannot act'] } };
    }

    const damages: TurnResult['damages'] = [];
    const messages: string[] = [];

    for (const targetId of action.targetIds) {
        const target = findUnit(newState.units, targetId);
        if (!target || !target.isAlive) continue;

        const dmg = calculateDamage(source, target);
        applyDamage(target, dmg);
        damages.push({ targetId, amount: dmg, isHeal: false });
        messages.push(`${source.name} attacks ${target.name} for ${dmg} damage!`);

        if (!target.isAlive) {
            messages.push(`${target.name} has been defeated!`);
        }
    }

    return { state: newState, result: { action, damages, messages } };
}

// ---- Execute Magic ----

export function executeMagic(
    state: CombatState,
    action: CombatAction,
    ability: Ability
): { state: CombatState; result: TurnResult } {
    const newState = cloneState(state);
    const source = findUnit(newState.units, action.sourceId);
    if (!source || !source.isAlive) {
        return { state: newState, result: { action, damages: [], messages: ['Unit cannot act'] } };
    }

    if (source.mp < ability.mpCost) {
        return {
            state: newState,
            result: { action, damages: [], messages: [`${source.name} doesn't have enough MP!`] },
        };
    }

    source.mp -= ability.mpCost;
    const damages: TurnResult['damages'] = [];
    const messages: string[] = [];
    messages.push(`${source.name} uses ${ability.name}!`);

    const isHealAbility = ability.targetType === 'single_ally' || ability.targetType === 'all_allies';

    for (const targetId of action.targetIds) {
        const target = findUnit(newState.units, targetId);
        if (!target) continue;

        if (isHealAbility) {
            if (!target.isAlive && ability.name !== 'Revive') continue;
            const heal = calculateHeal(ability.power);
            applyHeal(target, heal);
            damages.push({ targetId, amount: heal, isHeal: true });
            messages.push(`${target.name} recovers ${heal} HP!`);
        } else {
            if (!target.isAlive) continue;
            const dmg = calculateMagicDamage(source, target, ability.power);
            applyDamage(target, dmg);
            damages.push({ targetId, amount: dmg, isHeal: false });
            messages.push(`${target.name} takes ${dmg} magic damage!`);
            if (!target.isAlive) {
                messages.push(`${target.name} has been defeated!`);
            }
        }
    }

    return { state: newState, result: { action, damages, messages } };
}

// ---- Execute Defend ----

export function executeDefend(
    state: CombatState,
    action: CombatAction
): { state: CombatState; result: TurnResult } {
    const newState = cloneState(state);
    const source = findUnit(newState.units, action.sourceId);
    if (!source || !source.isAlive) {
        return { state: newState, result: { action, damages: [], messages: ['Unit cannot act'] } };
    }

    const defendEffect: StatusEffect = {
        id: `defend-${source.id}-${newState.turnNumber}`,
        name: 'Defending',
        type: 'defending',
        value: 0,
        turnsRemaining: 1,
    };

    source.statusEffects.push(defendEffect);
    const messages = [`${source.name} takes a defensive stance!`];

    return {
        state: newState,
        result: { action, damages: [], messages, defenderId: source.id },
    };
}

// ---- Execute Item ----

export function executeItem(
    state: CombatState,
    action: CombatAction,
    item: Item
): { state: CombatState; result: TurnResult } {
    const newState = cloneState(state);
    const source = findUnit(newState.units, action.sourceId);
    if (!source || !source.isAlive) {
        return { state: newState, result: { action, damages: [], messages: ['Unit cannot act'] } };
    }

    // Find and consume item from inventory
    const invItem = newState.inventory.find((i) => i.item.id === item.id);
    if (!invItem || invItem.quantity <= 0) {
        return {
            state: newState,
            result: { action, damages: [], messages: [`No ${item.name} left!`] },
        };
    }
    invItem.quantity -= 1;

    const damages: TurnResult['damages'] = [];
    const messages: string[] = [];
    messages.push(`${source.name} uses ${item.name}!`);

    for (const targetId of action.targetIds) {
        const target = findUnit(newState.units, targetId);
        if (!target) continue;

        switch (item.effectType) {
            case 'heal_hp': {
                applyHeal(target, item.effectValue);
                damages.push({ targetId, amount: item.effectValue, isHeal: true });
                messages.push(`${target.name} recovers ${item.effectValue} HP!`);
                break;
            }
            case 'heal_mp': {
                target.mp = Math.min(target.maxMp, target.mp + item.effectValue);
                messages.push(`${target.name} recovers ${item.effectValue} MP!`);
                break;
            }
            case 'revive': {
                if (!target.isAlive) {
                    target.isAlive = true;
                    target.hp = item.effectValue;
                    damages.push({ targetId, amount: item.effectValue, isHeal: true });
                    messages.push(`${target.name} has been revived!`);
                } else {
                    messages.push(`${target.name} is already alive!`);
                    invItem.quantity += 1; // Refund item
                }
                break;
            }
            case 'buff_atk': {
                const effect: StatusEffect = {
                    id: `buff-atk-${target.id}-${newState.turnNumber}`,
                    name: 'ATK Up',
                    type: 'buff_atk',
                    value: item.effectValue,
                    turnsRemaining: 3,
                };
                target.statusEffects.push(effect);
                target.atk += item.effectValue;
                messages.push(`${target.name}'s ATK increased by ${item.effectValue}!`);
                break;
            }
            case 'buff_def': {
                const effect: StatusEffect = {
                    id: `buff-def-${target.id}-${newState.turnNumber}`,
                    name: 'DEF Up',
                    type: 'buff_def',
                    value: item.effectValue,
                    turnsRemaining: 3,
                };
                target.statusEffects.push(effect);
                target.def += item.effectValue;
                messages.push(`${target.name}'s DEF increased by ${item.effectValue}!`);
                break;
            }
        }
    }

    return { state: newState, result: { action, damages, messages } };
}
