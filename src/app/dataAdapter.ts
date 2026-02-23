import type { CharacterData, EnemyData, Item, BattleConfig } from '../engine/types';
import {
    fetchCharacters,
    fetchEnemies,
    fetchItems,
    fetchBattleConfigs,
} from '../infra/characterRepository';

export interface GameData {
    characters: CharacterData[];
    enemies: EnemyData[];
    items: Item[];
    battleConfigs: BattleConfig[];
}

let cachedData: GameData | null = null;

export async function loadGameData(): Promise<GameData> {
    if (cachedData) return cachedData;

    const [characters, enemies, items, battleConfigs] = await Promise.all([
        fetchCharacters(),
        fetchEnemies(),
        fetchItems(),
        fetchBattleConfigs(),
    ]);

    cachedData = { characters, enemies, items, battleConfigs };
    return cachedData;
}

export function clearCache(): void {
    cachedData = null;
}
