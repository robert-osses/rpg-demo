import { describe, it, expect } from 'vitest';
import { initCombatState, processTurn, checkBattleEnd } from './combat';
import type { CharacterData, EnemyData, InventoryItem, CombatAction } from './types';

const mockCharacter: CharacterData = {
    id: 'char-1',
    name: 'Warrior',
    class: 'Warrior',
    hp: 200,
    mp: 30,
    atk: 25,
    def: 20,
    spd: 15,
    spriteColor: '#3366cc',
    spriteShape: 'box',
    abilities: [
        {
            id: 'ability-ps',
            name: 'Power Strike',
            type: 'physical',
            mpCost: 3,
            power: 20,
            targetType: 'single_enemy',
            description: 'A powerful strike',
        },
    ],
};

const mockEnemy: EnemyData = {
    id: 'enemy-1',
    name: 'Goblin',
    class: 'Goblin',
    hp: 80,
    mp: 10,
    atk: 12,
    def: 8,
    spd: 10,
    spriteColor: '#44aa44',
    spriteShape: 'box',
    aiType: 'basic',
    abilities: [],
};

const mockInventory: InventoryItem[] = [
    {
        item: {
            id: 'potion-1',
            name: 'Potion',
            effectType: 'heal_hp',
            effectValue: 50,
            description: 'Heals 50 HP',
        },
        quantity: 3,
    },
];

describe('combat', () => {
    describe('initCombatState', () => {
        it('creates combat state with all units', () => {
            const state = initCombatState([mockCharacter], [mockEnemy], mockInventory);
            expect(state.units).toHaveLength(2);
            expect(state.units[0].isPlayer).toBe(true);
            expect(state.units[1].isPlayer).toBe(false);
            expect(state.turnQueue).toHaveLength(2);
            expect(state.phase).toBe('selecting');
        });

        it('sets correct initial HP/MP', () => {
            const state = initCombatState([mockCharacter], [mockEnemy], mockInventory);
            const player = state.units[0];
            expect(player.hp).toBe(200);
            expect(player.maxHp).toBe(200);
            expect(player.mp).toBe(30);
            expect(player.maxMp).toBe(30);
        });
    });

    describe('processTurn', () => {
        it('processes an attack action', () => {
            const state = initCombatState([mockCharacter], [mockEnemy], mockInventory);
            const attackAction: CombatAction = {
                type: 'attack',
                sourceId: state.units[0].id,
                targetIds: [state.units[1].id],
            };
            const newState = processTurn(state, attackAction);
            // Enemy should have taken damage
            const enemy = newState.units.find((u) => !u.isPlayer);
            expect(enemy).toBeDefined();
            expect(enemy!.hp).toBeLessThan(80);
            expect(newState.log.length).toBeGreaterThan(state.log.length);
        });

        it('processes a defend action', () => {
            const state = initCombatState([mockCharacter], [mockEnemy], mockInventory);
            const playerUnit = state.units[0];
            const defendAction: CombatAction = {
                type: 'defend',
                sourceId: playerUnit.id,
                targetIds: [playerUnit.id],
            };
            const newState = processTurn(state, defendAction);
            // Defend action should be logged
            const lastResult = newState.turnResults[newState.turnResults.length - 1];
            expect(lastResult).toBeDefined();
            expect(lastResult.action.type).toBe('defend');
            expect(lastResult.defenderId).toBe(playerUnit.id);
            expect(newState.log.some((l) => l.includes('defensive stance'))).toBe(true);
        });
    });

    describe('checkBattleEnd', () => {
        it('returns victory when all enemies dead', () => {
            const state = initCombatState([mockCharacter], [mockEnemy], mockInventory);
            state.units.filter((u) => !u.isPlayer).forEach((u) => {
                u.isAlive = false;
                u.hp = 0;
            });
            expect(checkBattleEnd(state)).toBe('victory');
        });

        it('returns defeat when all players dead', () => {
            const state = initCombatState([mockCharacter], [mockEnemy], mockInventory);
            state.units.filter((u) => u.isPlayer).forEach((u) => {
                u.isAlive = false;
                u.hp = 0;
            });
            expect(checkBattleEnd(state)).toBe('defeat');
        });

        it('returns null when battle is ongoing', () => {
            const state = initCombatState([mockCharacter], [mockEnemy], mockInventory);
            expect(checkBattleEnd(state)).toBeNull();
        });
    });
});
