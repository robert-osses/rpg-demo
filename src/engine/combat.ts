import type {
    CombatState,
    CombatAction,
    CombatUnit,
    CharacterData,
    EnemyData,
    InventoryItem,
    TurnResult,
} from './types';
import { buildTurnQueue, getCurrentUnitId, advanceTurn } from './turnQueue';
import { executeAttack, executeMagic, executeDefend, executeItem } from './actions';

// ---- Create initial combat state ----

export function createCombatUnit(
    data: CharacterData | EnemyData,
    isPlayer: boolean,
    index: number
): CombatUnit {
    return {
        id: `${isPlayer ? 'player' : 'enemy'}-${index}-${data.id}`,
        name: data.name,
        hp: data.hp,
        maxHp: data.hp,
        mp: data.mp,
        maxMp: data.mp,
        atk: data.atk,
        def: data.def,
        spd: data.spd,
        baseatk: data.atk,
        basedef: data.def,
        isPlayer,
        isAlive: true,
        spriteColor: data.spriteColor,
        spriteShape: data.spriteShape,
        abilities: data.abilities,
        statusEffects: [],
        aiType: isPlayer ? undefined : (data as EnemyData).aiType,
    };
}

export function initCombatState(
    characters: CharacterData[],
    enemies: EnemyData[],
    inventory: InventoryItem[]
): CombatState {
    const playerUnits = characters.map((c, i) => createCombatUnit(c, true, i));
    const enemyUnits = enemies.map((e, i) => createCombatUnit(e, false, i));
    const allUnits = [...playerUnits, ...enemyUnits];
    const turnQueue = buildTurnQueue(allUnits);

    return {
        units: allUnits,
        turnQueue,
        currentTurnIndex: 0,
        phase: 'selecting',
        log: ['Battle begins!'],
        turnResults: [],
        inventory,
        turnNumber: 1,
    };
}

// ---- Process a turn ----

export function processTurn(
    state: CombatState,
    action: CombatAction
): CombatState {
    const currentUnitId = getCurrentUnitId(state.turnQueue, state.currentTurnIndex);
    if (!currentUnitId) return { ...state, phase: 'defeat' };

    const currentUnit = state.units.find((u) => u.id === currentUnitId);
    if (!currentUnit || !currentUnit.isAlive) {
        // Skip dead unit
        const advanced = advanceTurn(state.units, state.turnQueue, state.currentTurnIndex);
        return {
            ...state,
            turnQueue: advanced.turnQueue,
            currentTurnIndex: advanced.currentTurnIndex,
        };
    }

    // Execute the action
    let result: { state: CombatState; result: TurnResult };

    switch (action.type) {
        case 'attack':
            result = executeAttack(state, action);
            break;
        case 'magic': {
            const ability = currentUnit.abilities.find((a) => a.id === action.abilityId);
            if (!ability) {
                return state;
            }
            result = executeMagic(state, action, ability);
            break;
        }
        case 'defend':
            result = executeDefend(state, action);
            break;
        case 'item': {
            const item = state.inventory.find((i) => i.item.id === action.itemId)?.item;
            if (!item) {
                return state;
            }
            result = executeItem(state, action, item);
            break;
        }
        default:
            return state;
    }

    let newState = result.state;
    newState.log = [...newState.log, ...result.result.messages];
    newState.turnResults = [...newState.turnResults, result.result];

    // Check victory/defeat
    const victoryCheck = checkBattleEnd(newState);
    if (victoryCheck) {
        newState.phase = victoryCheck;
        return newState;
    }

    // Process end-of-turn effects
    newState = processEndOfTurnEffects(newState, currentUnitId);

    // Advance turn
    const advanced = advanceTurn(newState.units, newState.turnQueue, newState.currentTurnIndex);
    newState.turnQueue = advanced.turnQueue;
    newState.currentTurnIndex = advanced.currentTurnIndex;
    if (advanced.newRound) {
        newState.turnNumber += 1;
    }

    // Determine next phase
    const nextUnitId = getCurrentUnitId(newState.turnQueue, newState.currentTurnIndex);
    const nextUnit = newState.units.find((u) => u.id === nextUnitId);

    if (nextUnit && !nextUnit.isPlayer) {
        newState.phase = 'enemy_turn';
    } else {
        newState.phase = 'selecting';
    }

    return newState;
}

// ---- End-of-turn effects ----

function processEndOfTurnEffects(state: CombatState, unitId: string): CombatState {
    const newState = JSON.parse(JSON.stringify(state)) as CombatState;
    const unit = newState.units.find((u) => u.id === unitId);
    if (!unit) return newState;

    // Tick down status effects
    unit.statusEffects = unit.statusEffects
        .map((e) => ({ ...e, turnsRemaining: e.turnsRemaining - 1 }))
        .filter((e) => {
            if (e.turnsRemaining <= 0) {
                // Remove expired effects
                if (e.type === 'buff_atk') {
                    unit.atk = Math.max(unit.baseatk, unit.atk - e.value);
                }
                if (e.type === 'buff_def') {
                    unit.def = Math.max(unit.basedef, unit.def - e.value);
                }
                return false;
            }
            return true;
        });

    return newState;
}

// ---- Victory/Defeat check ----

export function checkBattleEnd(state: CombatState): 'victory' | 'defeat' | null {
    const playerAlive = state.units.some((u) => u.isPlayer && u.isAlive);
    const enemyAlive = state.units.some((u) => !u.isPlayer && u.isAlive);

    if (!playerAlive) return 'defeat';
    if (!enemyAlive) return 'victory';
    return null;
}
