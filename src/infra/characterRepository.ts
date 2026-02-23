import { supabase } from './supabaseClient';
import type { CharacterData, EnemyData, Item, Ability, BattleConfig } from '../engine/types';

// ---- Abilities ----

export async function fetchAbilities(): Promise<Ability[]> {
    const { data, error } = await supabase.from('abilities').select('*');
    if (error) throw new Error(`Failed to fetch abilities: ${error.message}`);
    return (data ?? []).map(mapAbility);
}

function mapAbility(row: Record<string, unknown>): Ability {
    return {
        id: row.id as string,
        name: row.name as string,
        type: row.type as Ability['type'],
        mpCost: row.mp_cost as number,
        power: row.power as number,
        targetType: row.target_type as Ability['targetType'],
        description: (row.description as string) ?? '',
    };
}

// ---- Characters ----

export async function fetchCharacters(): Promise<CharacterData[]> {
    const { data, error } = await supabase
        .from('characters')
        .select(`
      *,
      character_abilities (
        ability:abilities (*)
      )
    `);
    if (error) throw new Error(`Failed to fetch characters: ${error.message}`);
    return (data ?? []).map(mapCharacter);
}

function mapCharacter(row: Record<string, unknown>): CharacterData {
    const abilitiesRaw = (row.character_abilities as Array<{ ability: Record<string, unknown> }>) ?? [];
    return {
        id: row.id as string,
        name: row.name as string,
        class: (row.class as string) ?? 'Adventurer',
        hp: row.hp as number,
        mp: row.mp as number,
        atk: row.atk as number,
        def: row.def as number,
        spd: row.spd as number,
        spriteColor: row.sprite_color as string,
        spriteShape: row.sprite_shape as CharacterData['spriteShape'],
        abilities: abilitiesRaw.map((ca) => mapAbility(ca.ability)),
    };
}

// ---- Enemies ----

export async function fetchEnemies(): Promise<EnemyData[]> {
    const { data, error } = await supabase
        .from('enemies')
        .select(`
      *,
      enemy_abilities (
        ability:abilities (*)
      )
    `);
    if (error) throw new Error(`Failed to fetch enemies: ${error.message}`);
    return (data ?? []).map(mapEnemy);
}

function mapEnemy(row: Record<string, unknown>): EnemyData {
    const abilitiesRaw = (row.enemy_abilities as Array<{ ability: Record<string, unknown> }>) ?? [];
    return {
        id: row.id as string,
        name: row.name as string,
        class: (row.class as string) ?? 'Monster',
        hp: row.hp as number,
        mp: row.mp as number,
        atk: row.atk as number,
        def: row.def as number,
        spd: row.spd as number,
        spriteColor: row.sprite_color as string,
        spriteShape: row.sprite_shape as EnemyData['spriteShape'],
        aiType: row.ai_type as EnemyData['aiType'],
        abilities: abilitiesRaw.map((ca) => mapAbility(ca.ability)),
    };
}

// ---- Items ----

export async function fetchItems(): Promise<Item[]> {
    const { data, error } = await supabase.from('items').select('*');
    if (error) throw new Error(`Failed to fetch items: ${error.message}`);
    return (data ?? []).map(mapItem);
}

function mapItem(row: Record<string, unknown>): Item {
    return {
        id: row.id as string,
        name: row.name as string,
        effectType: row.effect_type as Item['effectType'],
        effectValue: row.effect_value as number,
        description: (row.description as string) ?? '',
    };
}

// ---- Battle Configs ----

export async function fetchBattleConfigs(): Promise<BattleConfig[]> {
    const { data, error } = await supabase
        .from('battle_configs')
        .select(`
      *,
      battle_config_enemies (
        quantity,
        enemy:enemies (
          *,
          enemy_abilities (
            ability:abilities (*)
          )
        )
      )
    `);
    if (error) throw new Error(`Failed to fetch battle configs: ${error.message}`);
    return (data ?? []).map(mapBattleConfig);
}

function mapBattleConfig(row: Record<string, unknown>): BattleConfig {
    const enemiesRaw = (row.battle_config_enemies as Array<{
        quantity: number;
        enemy: Record<string, unknown>;
    }>) ?? [];
    return {
        id: row.id as string,
        name: row.name as string,
        description: (row.description as string) ?? '',
        backgroundType: row.background_type as string,
        enemies: enemiesRaw.map((bce) => ({
            enemy: mapEnemy(bce.enemy),
            quantity: bce.quantity,
        })),
    };
}
