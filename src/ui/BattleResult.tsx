import React from 'react';

interface BattleResultProps {
    isVictory: boolean;
    onRetry: () => void;
    onMenu: () => void;
}

export const BattleResult: React.FC<BattleResultProps> = ({
    isVictory,
    onRetry,
    onMenu,
}) => {
    return (
        <div className="battle-result">
            <h1
                className={`battle-result__title ${isVictory
                        ? 'battle-result__title--victory'
                        : 'battle-result__title--defeat'
                    }`}
            >
                {isVictory ? 'Victory!' : 'Defeat'}
            </h1>
            <p className="battle-result__subtitle">
                {isVictory
                    ? 'Your team has emerged victorious!'
                    : 'Your party has been defeated...'}
            </p>
            <div className="battle-result__actions">
                <button className="btn btn--primary" onClick={onRetry}>
                    Retry Battle
                </button>
                <button className="btn" onClick={onMenu}>
                    Main Menu
                </button>
            </div>
        </div>
    );
};
