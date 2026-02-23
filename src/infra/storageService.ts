const STORAGE_KEY = 'rpg-demo-save';

interface SaveData {
    selectedTeamIds: string[];
    battleConfigId: string | null;
    timestamp: number;
}

export function saveGameState(data: SaveData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save game state:', e);
    }
}

export function loadGameState(): SaveData | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as SaveData;
    } catch (e) {
        console.error('Failed to load game state:', e);
        return null;
    }
}

export function clearGameState(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Failed to clear game state:', e);
    }
}
