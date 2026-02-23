import React, { useState } from 'react';
import type { Ability, InventoryItem } from '../engine/types';

interface ActionPanelProps {
    unitName: string;
    abilities: Ability[];
    unitMp: number;
    inventory: InventoryItem[];
    onAttack: () => void;
    onMagic: (abilityId: string) => void;
    onDefend: () => void;
    onItem: (itemId: string) => void;
    disabled: boolean;
}

type SubMenu = 'none' | 'magic' | 'item';

export const ActionPanel: React.FC<ActionPanelProps> = ({
    unitName,
    abilities,
    unitMp,
    inventory,
    onAttack,
    onMagic,
    onDefend,
    onItem,
    disabled,
}) => {
    const [subMenu, setSubMenu] = useState<SubMenu>('none');

    const handleAction = (action: SubMenu | 'attack' | 'defend') => {
        if (action === 'attack') {
            setSubMenu('none');
            onAttack();
        } else if (action === 'defend') {
            setSubMenu('none');
            onDefend();
        } else {
            setSubMenu(action);
        }
    };

    return (
        <div className="action-panel">
            <div className="action-panel__header">
                ⚔️ {unitName}'s Turn
            </div>
            <div className="action-panel__content">
                <div className="action-panel__main-actions">
                    <button
                        className="btn btn--action"
                        onClick={() => handleAction('attack')}
                        disabled={disabled}
                    >
                        ⚔️ Attack
                    </button>
                    <button
                        className={`btn btn--action ${subMenu === 'magic' ? 'btn--primary' : ''}`}
                        onClick={() => handleAction('magic')}
                        disabled={disabled || abilities.length === 0}
                    >
                        ✨ Magic
                    </button>
                    <button
                        className="btn btn--action"
                        onClick={() => handleAction('defend')}
                        disabled={disabled}
                    >
                        🛡️ Defend
                    </button>
                    <button
                        className={`btn btn--action ${subMenu === 'item' ? 'btn--primary' : ''}`}
                        onClick={() => handleAction('item')}
                        disabled={disabled || inventory.every((i) => i.quantity <= 0)}
                    >
                        🎒 Item
                    </button>
                </div>

                <div className="action-panel__submenu">
                    {subMenu === 'magic' &&
                        abilities.map((ability) => (
                            <button
                                key={ability.id}
                                className="action-panel__submenu-item"
                                onClick={() => {
                                    setSubMenu('none');
                                    onMagic(ability.id);
                                }}
                                disabled={unitMp < ability.mpCost}
                            >
                                <span>
                                    {ability.name}
                                    <br />
                                    <span style={{ fontSize: '0.7rem', color: '#8b949e' }}>
                                        {ability.description}
                                    </span>
                                </span>
                                <span className="action-panel__submenu-cost">
                                    {ability.mpCost} MP
                                </span>
                            </button>
                        ))}

                    {subMenu === 'item' &&
                        inventory
                            .filter((inv) => inv.quantity > 0)
                            .map((inv) => (
                                <button
                                    key={inv.item.id}
                                    className="action-panel__submenu-item"
                                    onClick={() => {
                                        setSubMenu('none');
                                        onItem(inv.item.id);
                                    }}
                                >
                                    <span>
                                        {inv.item.name}
                                        <br />
                                        <span style={{ fontSize: '0.7rem', color: '#8b949e' }}>
                                            {inv.item.description}
                                        </span>
                                    </span>
                                    <span className="action-panel__submenu-qty">
                                        x{inv.quantity}
                                    </span>
                                </button>
                            ))}

                    {subMenu === 'none' && (
                        <div style={{ color: '#6e7681', padding: '16px', fontSize: '0.85rem' }}>
                            Choose an action to begin your turn.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
