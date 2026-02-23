import React, { useState, useEffect, useCallback } from 'react';
import type {
  CharacterData,
  BattleConfig,
  CombatState,
} from './engine/types';
import { loadGameData, type GameData } from './app/dataAdapter';
import { startBattle } from './app/battleAdapter';
import { MainMenu } from './ui/MainMenu';
import { TeamSelection } from './ui/TeamSelection';
import { BattleScreen } from './ui/BattleScreen';
import { getPortraitUrl } from './ui/PortraitGenerator';

type Screen = 'menu' | 'team-select' | 'battle-select' | 'battle';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<CharacterData[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<BattleConfig | null>(null);
  const [combatState, setCombatState] = useState<CombatState | null>(null);

  // Load game data from Supabase
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadGameData();
      setGameData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load game data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartGame = () => {
    setScreen('team-select');
  };

  const handleTeamConfirm = (selectedIds: string[]) => {
    if (!gameData) return;
    const team = gameData.characters.filter((c) => selectedIds.includes(c.id));
    setSelectedTeam(team);
    setScreen('battle-select');
  };

  const handleBattleSelect = (battleConfig: BattleConfig) => {
    if (!gameData) return;
    setSelectedBattle(battleConfig);
    const state = startBattle(selectedTeam, battleConfig, gameData.items);
    setCombatState(state);
    setScreen('battle');
  };

  const handleRetry = () => {
    if (!selectedBattle || !gameData) return;
    const state = startBattle(selectedTeam, selectedBattle, gameData.items);
    setCombatState(state);
  };

  const handleMenu = () => {
    setScreen('menu');
    setCombatState(null);
    setSelectedTeam([]);
    setSelectedBattle(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading__spinner" />
        <span>Loading game data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading">
        <span style={{ color: '#f85149' }}>Error: {error}</span>
        <button className="btn btn--small" onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  switch (screen) {
    case 'menu':
      return <MainMenu onStartGame={handleStartGame} />;

    case 'team-select':
      return (
        <TeamSelection
          characters={gameData?.characters ?? []}
          onConfirm={handleTeamConfirm}
          onBack={() => setScreen('menu')}
        />
      );

    case 'battle-select':
      return (
        <BattleSelectScreen
          battles={gameData?.battleConfigs ?? []}
          onSelect={handleBattleSelect}
          onBack={() => setScreen('team-select')}
        />
      );

    case 'battle':
      if (!combatState) return null;
      return (
        <BattleScreen
          initialState={combatState}
          backgroundType={selectedBattle?.backgroundType ?? 'forest'}
          onRetry={handleRetry}
          onMenu={handleMenu}
        />
      );

    default:
      return null;
  }
};

// ---- Battle Select Screen ----

interface BattleSelectScreenProps {
  battles: BattleConfig[];
  onSelect: (config: BattleConfig) => void;
  onBack: () => void;
}

const BattleSelectScreen: React.FC<BattleSelectScreenProps> = ({
  battles,
  onSelect,
  onBack,
}) => {
  return (
    <div className="battle-select">
      <div className="team-selection__header">
        <h2 className="battle-select__title">Choose Your Battle</h2>
      </div>

      <div className="battle-select__grid">
        {battles.map((battle) => (
          <div
            key={battle.id}
            className="battle-card"
            onClick={() => onSelect(battle)}
          >
            <div className="battle-card__name">{battle.name}</div>
            <div className="battle-card__desc">{battle.description}</div>
            <div className="battle-card__env-badge">
              {battle.backgroundType === 'forest' && '🌲'}
              {battle.backgroundType === 'cave' && '🪨'}
              {battle.backgroundType === 'dark' && '🏰'}
              {' '}{battle.backgroundType.charAt(0).toUpperCase() + battle.backgroundType.slice(1)}
            </div>
            <div className="battle-card__enemies">
              {battle.enemies.map((entry, i) => (
                <div key={i} className="battle-card__enemy">
                  <img
                    className="battle-card__enemy-portrait"
                    src={getPortraitUrl(entry.enemy.name, entry.enemy.class, entry.enemy.spriteColor, true)}
                    alt={`${entry.enemy.name} portrait`}
                  />
                  <div className="battle-card__enemy-info">
                    <span className="battle-card__enemy-name">
                      {entry.enemy.name} x{entry.quantity}
                    </span>
                    <span className="battle-card__enemy-class">{entry.enemy.class}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="team-selection__footer">
        <button className="btn btn--small" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  );
};

