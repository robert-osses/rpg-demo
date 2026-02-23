import React from 'react';
import type { UnitViewData } from '../app/battleAdapter';

interface TargetSelectorProps {
    targets: UnitViewData[];
    isAllyTarget: boolean;
    onSelect: (targetId: string) => void;
    onSelectAll: () => void;
    onCancel: () => void;
    selectAll: boolean;
}

export const TargetSelector: React.FC<TargetSelectorProps> = ({
    targets,
    isAllyTarget,
    onSelect,
    onSelectAll,
    onCancel,
    selectAll,
}) => {
    if (selectAll) {
        // Auto-select all and trigger immediately
        React.useEffect(() => {
            onSelectAll();
        }, []);
        return null;
    }

    return (
        <div className="target-selector">
            <div className="target-selector__title">
                {isAllyTarget ? '🟢 Select an Ally' : '🔴 Select a Target'}
            </div>
            <div className="target-selector__units">
                {targets
                    .filter((t) => t.isAlive)
                    .map((target) => (
                        <button
                            key={target.id}
                            className={`target-selector__unit ${isAllyTarget ? 'target-selector__unit--ally' : ''
                                }`}
                            onClick={() => onSelect(target.id)}
                        >
                            <span
                                className="char-card__color-dot"
                                style={{
                                    backgroundColor: target.spriteColor,
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                            />
                            {target.name}
                            <br />
                            <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                                HP: {target.hp}/{target.maxHp}
                            </span>
                        </button>
                    ))}
            </div>
            <button className="btn btn--small target-selector__cancel" onClick={onCancel}>
                Cancel
            </button>
        </div>
    );
};
