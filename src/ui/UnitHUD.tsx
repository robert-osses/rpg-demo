import React from 'react';
import type { UnitViewData } from '../app/battleAdapter';

interface UnitHUDProps {
    unit: UnitViewData;
}

export const UnitHUD: React.FC<UnitHUDProps> = ({ unit }) => {
    const hpPercent = unit.maxHp > 0 ? (unit.hp / unit.maxHp) * 100 : 0;
    const mpPercent = unit.maxMp > 0 ? (unit.mp / unit.maxMp) * 100 : 0;

    const hpClass =
        hpPercent > 50
            ? 'unit-hud__bar-fill--hp'
            : hpPercent > 25
                ? 'unit-hud__bar-fill--hp-mid'
                : 'unit-hud__bar-fill--hp-low';

    const classes = [
        'unit-hud',
        unit.isCurrentTurn ? 'unit-hud--active' : '',
        !unit.isAlive ? 'unit-hud--dead' : '',
        !unit.isPlayer ? 'unit-hud--enemy' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes}>
            <div className="unit-hud__name">
                <span
                    className="char-card__color-dot"
                    style={{ backgroundColor: unit.spriteColor }}
                />
                {unit.name}
                {unit.isDefending && ' 🛡️'}
            </div>

            <div className="unit-hud__bar-wrapper">
                <div className="unit-hud__bar-label">
                    <span>HP</span>
                    <span>
                        {unit.hp}/{unit.maxHp}
                    </span>
                </div>
                <div className="unit-hud__bar">
                    <div
                        className={`unit-hud__bar-fill ${hpClass}`}
                        style={{ width: `${hpPercent}%` }}
                    />
                </div>
            </div>

            <div className="unit-hud__bar-wrapper">
                <div className="unit-hud__bar-label">
                    <span>MP</span>
                    <span>
                        {unit.mp}/{unit.maxMp}
                    </span>
                </div>
                <div className="unit-hud__bar">
                    <div
                        className="unit-hud__bar-fill unit-hud__bar-fill--mp"
                        style={{ width: `${mpPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
