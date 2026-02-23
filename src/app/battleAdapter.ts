import type {
    CombatState,
    CombatAction,
    CombatUnit,
    CharacterData,
    EnemyData,
    BattleConfig,
    InventoryItem,
    Item,
} from '../engine/types';
import { initCombatState, processTurn } from '../engine/combat';
import { getCurrentUnitId } from '../engine/turnQueue';
import { decideEnemyAction } from '../engine/enemyAI';

// ---- View State Types ----

export interface UnitViewData {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    isPlayer: boolean;
    isAlive: boolean;
    spriteColor: string;
    spriteShape: string;
    isCurrentTurn: boolean;
    isDefending: boolean;
}

export interface BattleViewState {
    playerUnits: UnitViewData[];
    enemyUnits: UnitViewData[];
    currentUnit: UnitViewData | null;
    phase: CombatState['phase'];
    log: string[];
    inventory: InventoryItem[];
    turnNumber: number;
    canAct: boolean;
}

// ---- Adapter Functions ----

export function startBattle(
    characters: CharacterData[],
    battleConfig: BattleConfig,
    items: Item[]
): CombatState {
    // Expand enemies based on battle config quantities
    const enemies: EnemyData[] = [];
    for (const entry of battleConfig.enemies) {
        for (let i = 0; i < entry.quantity; i++) {
            enemies.push({
                ...entry.enemy,
                id: `${entry.enemy.id}-${i}`,
            });
        }
    }

    // Default inventory: 3 potions, 2 ethers, 1 phoenix down
    const inventory: InventoryItem[] = items.map((item) => ({
        item,
        quantity: item.effectType === 'heal_hp' ? 3 : item.effectType === 'heal_mp' ? 2 : 1,
    }));

    return initCombatState(characters, enemies, inventory);
}

export function mapStateToView(state: CombatState): BattleViewState {
    const currentUnitId = getCurrentUnitId(state.turnQueue, state.currentTurnIndex);

    const mapUnit = (u: CombatUnit): UnitViewData => ({
        id: u.id,
        name: u.name,
        hp: u.hp,
        maxHp: u.maxHp,
        mp: u.mp,
        maxMp: u.maxMp,
        isPlayer: u.isPlayer,
        isAlive: u.isAlive,
        spriteColor: u.spriteColor,
        spriteShape: u.spriteShape,
        isCurrentTurn: u.id === currentUnitId,
        isDefending: u.statusEffects.some((e) => e.type === 'defending'),
    });

    const currentUnit = state.units.find((u) => u.id === currentUnitId);

    return {
        playerUnits: state.units.filter((u) => u.isPlayer).map(mapUnit),
        enemyUnits: state.units.filter((u) => !u.isPlayer).map(mapUnit),
        currentUnit: currentUnit ? mapUnit(currentUnit) : null,
        phase: state.phase,
        log: state.log.slice(-10), // Last 10 log entries
        inventory: state.inventory,
        turnNumber: state.turnNumber,
        canAct: state.phase === 'selecting' && currentUnit?.isPlayer === true,
    };
}

export function handlePlayerAction(
    state: CombatState,
    action: CombatAction
): CombatState {
    return processTurn(state, action);
}

export function processEnemyTurn(state: CombatState): CombatState {
    const currentUnitId = getCurrentUnitId(state.turnQueue, state.currentTurnIndex);
    if (!currentUnitId) return state;

    const currentUnit = state.units.find((u) => u.id === currentUnitId);
    if (!currentUnit || currentUnit.isPlayer || !currentUnit.isAlive) return state;

    const playerUnits = state.units.filter((u) => u.isPlayer);
    const enemyUnits = state.units.filter((u) => !u.isPlayer);
    const action = decideEnemyAction(currentUnit, playerUnits, enemyUnits);

    return processTurn(state, action);
}

export function getAbilitiesForCurrentUnit(state: CombatState) {
    const currentUnitId = getCurrentUnitId(state.turnQueue, state.currentTurnIndex);
    if (!currentUnitId) return [];
    const unit = state.units.find((u) => u.id === currentUnitId);
    if (!unit) return [];
    return unit.abilities;
}
