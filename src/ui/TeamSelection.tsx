import React, { useState } from 'react';
import type { CharacterData } from '../engine/types';
import { getPortraitUrl } from './PortraitGenerator';

interface TeamSelectionProps {
    characters: CharacterData[];
    onConfirm: (selectedIds: string[]) => void;
    onBack: () => void;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({
    characters,
    onConfirm,
    onBack,
}) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleCharacter = (id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((sid) => sid !== id);
            }
            if (prev.length >= 6) return prev;
            return [...prev, id];
        });
    };

    return (
        <div className="team-selection">
            <div className="team-selection__header">
                <h2 className="team-selection__title">Select Your Team</h2>
                <span className="team-selection__count">
                    {selectedIds.length} / 6 selected (min 1)
                </span>
            </div>

            <div className="team-selection__grid">
                {characters.map((char) => (
                    <div
                        key={char.id}
                        className={`char-card ${selectedIds.includes(char.id) ? 'char-card--selected' : ''
                            }`}
                        onClick={() => toggleCharacter(char.id)}
                    >
                        <div className="char-card__portrait-row">
                            <img
                                className="char-card__portrait"
                                src={getPortraitUrl(char.name, char.class, char.spriteColor, false)}
                                alt={`${char.name} portrait`}
                            />
                            <div className="char-card__info">
                                <div className="char-card__name">
                                    <span
                                        className="char-card__color-dot"
                                        style={{ backgroundColor: char.spriteColor }}
                                    />
                                    {char.name}
                                </div>
                                <span className="char-card__class-badge">{char.class}</span>
                            </div>
                        </div>
                        <div className="char-card__stats">
                            <div className="char-card__stat">
                                <div className="char-card__stat-label">HP</div>
                                <div className="char-card__stat-value">{char.hp}</div>
                            </div>
                            <div className="char-card__stat">
                                <div className="char-card__stat-label">MP</div>
                                <div className="char-card__stat-value">{char.mp}</div>
                            </div>
                            <div className="char-card__stat">
                                <div className="char-card__stat-label">ATK</div>
                                <div className="char-card__stat-value">{char.atk}</div>
                            </div>
                            <div className="char-card__stat">
                                <div className="char-card__stat-label">DEF</div>
                                <div className="char-card__stat-value">{char.def}</div>
                            </div>
                            <div className="char-card__stat">
                                <div className="char-card__stat-label">SPD</div>
                                <div className="char-card__stat-value">{char.spd}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="team-selection__footer">
                <button className="btn btn--small" onClick={onBack}>
                    ← Back
                </button>
                <button
                    className="btn btn--primary"
                    disabled={selectedIds.length < 1}
                    onClick={() => onConfirm(selectedIds)}
                >
                    Confirm Team ({selectedIds.length})
                </button>
            </div>
        </div>
    );
};

