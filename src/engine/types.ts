// ============================================================
// Engine Types — Pure domain types, no framework dependencies
// ============================================================

/** Ability target types */
export type TargetType = 'single_enemy' | 'all_enemies' | 'single_ally' | 'all_allies' | 'self';

/** Ability classification */
export type AbilityType = 'magic' | 'physical';

/** Item effect types */
export type ItemEffectType = 'heal_hp' | 'heal_mp' | 'revive' | 'buff_atk' | 'buff_def';

/** Enemy AI strategies */
export type AIType = 'basic' | 'aggressive' | 'defensive';

/** 3D shape for rendering */
export type SpriteShape = 'box' | 'sphere';

/** Combat phases */
export type CombatPhase = 'selecting' | 'targeting' | 'animating' | 'enemy_turn' | 'victory' | 'defeat';

/** Action types a unit can perform */
export type ActionType = 'attack' | 'magic' | 'defend' | 'item';

// ---- Data Models (from DB) ----

export interface Ability {
    id: string;
    name: string;
    type: AbilityType;
    mpCost: number;
    power: number;
    targetType: TargetType;
    description: string;
}

export interface Item {
    id: string;
    name: string;
    effectType: ItemEffectType;
    effectValue: number;
    description: string;
}

export interface CharacterData {
    id: string;
    name: string;
    class: string;
    hp: number;
    mp: number;
    atk: number;
    def: number;
    spd: number;
    spriteColor: string;
    spriteShape: SpriteShape;
    abilities: Ability[];
}

export interface EnemyData {
    id: string;
    name: string;
    class: string;
    hp: number;
    mp: number;
    atk: number;
    def: number;
    spd: number;
    spriteColor: string;
    spriteShape: SpriteShape;
    aiType: AIType;
    abilities: Ability[];
}

export interface BattleConfig {
    id: string;
    name: string;
    description: string;
    backgroundType: string;
    enemies: Array<{ enemy: EnemyData; quantity: number }>;
}

// ---- Runtime Combat Models ----

export interface StatusEffect {
    id: string;
    name: string;
    type: 'buff_atk' | 'buff_def' | 'defending';
    value: number;
    turnsRemaining: number;
}

export interface CombatUnit {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    atk: number;
    def: number;
    spd: number;
    baseatk: number;
    basedef: number;
    isPlayer: boolean;
    isAlive: boolean;
    spriteColor: string;
    spriteShape: SpriteShape;
    abilities: Ability[];
    statusEffects: StatusEffect[];
    aiType?: AIType;
}

export interface CombatAction {
    type: ActionType;
    sourceId: string;
    targetIds: string[];
    abilityId?: string;
    itemId?: string;
}

export interface TurnResult {
    action: CombatAction;
    damages: Array<{ targetId: string; amount: number; isHeal: boolean }>;
    messages: string[];
    defenderId?: string;
}

export interface InventoryItem {
    item: Item;
    quantity: number;
}

export interface CombatState {
    units: CombatUnit[];
    turnQueue: string[];
    currentTurnIndex: number;
    phase: CombatPhase;
    log: string[];
    turnResults: TurnResult[];
    inventory: InventoryItem[];
    turnNumber: number;
}
