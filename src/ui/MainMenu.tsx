import React from 'react';

interface MainMenuProps {
    onStartGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
    return (
        <div className="main-menu">
            <h1 className="main-menu__title">Antigravity</h1>
            <p className="main-menu__subtitle">Turn-Based RPG Battle</p>
            <div className="main-menu__buttons">
                <button className="btn btn--primary" onClick={onStartGame}>
                    New Battle
                </button>
            </div>
        </div>
    );
};
