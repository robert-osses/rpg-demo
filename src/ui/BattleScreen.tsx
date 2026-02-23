import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { CombatState, Ability, CombatAction } from '../engine/types';
import {
    mapStateToView,
    handlePlayerAction,
    processEnemyTurn,
    getAbilitiesForCurrentUnit,
    type BattleViewState,
} from '../app/battleAdapter';
import { getCurrentUnitId } from '../engine/turnQueue';
import { BattlefieldRenderer } from '../renderer/BattlefieldRenderer';
import { UnitHUD } from './UnitHUD';
import { ActionPanel } from './ActionPanel';
import { TargetSelector } from './TargetSelector';
import { BattleResult } from './BattleResult';

interface BattleScreenProps {
    initialState: CombatState;
    backgroundType: string;
    onRetry: () => void;
    onMenu: () => void;
}

type PendingAction =
    | { type: 'attack' }
    | { type: 'magic'; ability: Ability }
    | { type: 'item'; itemId: string };

export const BattleScreen: React.FC<BattleScreenProps> = ({
    initialState,
    backgroundType,
    onRetry,
    onMenu,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<BattlefieldRenderer | null>(null);
    const [combatState, setCombatState] = useState<CombatState>(initialState);
    const [viewState, setViewState] = useState<BattleViewState>(
        mapStateToView(initialState)
    );
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const logRef = useRef<HTMLDivElement>(null);

    // Keep a ref to the latest combat state so animation callbacks never get stale
    const stateRef = useRef<CombatState>(initialState);
    stateRef.current = combatState;

    // Initialize Three.js renderer
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const wrapper = canvas.parentElement;
        if (!wrapper) return;

        const width = wrapper.clientWidth;
        const height = wrapper.clientHeight;

        const renderer = new BattlefieldRenderer(canvas, width, height, backgroundType);
        rendererRef.current = renderer;

        const view = mapStateToView(initialState);
        renderer.setupUnits(view.playerUnits, view.enemyUnits);
        renderer.start();

        const handleResize = () => {
            if (wrapper) {
                renderer.resize(wrapper.clientWidth, wrapper.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
            rendererRef.current = null;
        };
    }, [initialState]);

    // Update view state when combat state changes
    useEffect(() => {
        const view = mapStateToView(combatState);
        setViewState(view);
        rendererRef.current?.updateUnits([...view.playerUnits, ...view.enemyUnits]);
    }, [combatState]);

    // Auto-scroll log
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [viewState.log]);

    // Helper: apply a new state update and handle the aftermath
    const applyNewState = useCallback((newState: CombatState) => {
        setCombatState(newState);
        stateRef.current = newState;
        setIsAnimating(false);
    }, []);

    // Helper: run a single enemy turn with animation
    const runEnemyTurn = useCallback((state: CombatState) => {
        setIsAnimating(true);

        const currentUnitId = getCurrentUnitId(state.turnQueue, state.currentTurnIndex);
        if (!currentUnitId) {
            applyNewState(state);
            return;
        }

        const newState = processEnemyTurn(state);
        const lastResult = newState.turnResults[newState.turnResults.length - 1];
        const targetId = lastResult?.action?.targetIds?.[0];

        const finalize = () => {
            applyNewState(newState);
        };

        if (lastResult && currentUnitId && targetId) {
            if (lastResult.action.type === 'attack') {
                rendererRef.current?.playAttackAnimation(currentUnitId, targetId, () => {
                    rendererRef.current?.playDamageEffect(targetId);
                    setTimeout(finalize, 400);
                });
            } else if (lastResult.action.type === 'magic') {
                rendererRef.current?.playMagicEffect(currentUnitId, targetId, () => {
                    for (const dmg of lastResult.damages) {
                        if (dmg.isHeal) {
                            rendererRef.current?.playHealEffect(dmg.targetId);
                        } else {
                            rendererRef.current?.playDamageEffect(dmg.targetId);
                        }
                    }
                    setTimeout(finalize, 400);
                });
            } else {
                // Defend or other non-animated action
                setTimeout(finalize, 300);
            }
        } else {
            setTimeout(finalize, 300);
        }
    }, [applyNewState]);

    // Process enemy turns automatically when it's an enemy's turn
    useEffect(() => {
        if (combatState.phase === 'enemy_turn' && !isAnimating) {
            const timer = setTimeout(() => {
                runEnemyTurn(combatState);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [combatState, isAnimating, runEnemyTurn]);

    // Get current unit abilities
    const currentAbilities = getAbilitiesForCurrentUnit(combatState);
    const currentUnit = combatState.units.find(
        (u) =>
            u.id ===
            getCurrentUnitId(combatState.turnQueue, combatState.currentTurnIndex)
    );

    // ---- Action Handlers ----

    const performAction = useCallback(
        (action: CombatAction) => {
            setIsAnimating(true);
            const srcState = stateRef.current; // Always use the latest state
            const targetId = action.targetIds[0];
            const currentUnitId = getCurrentUnitId(srcState.turnQueue, srcState.currentTurnIndex);

            const finalize = (newState: CombatState) => {
                applyNewState(newState);
            };

            if (action.type === 'defend') {
                const newState = handlePlayerAction(srcState, action);
                finalize(newState);
                return;
            }

            if (action.type === 'item') {
                const newState = handlePlayerAction(srcState, action);
                const lastResult = newState.turnResults[newState.turnResults.length - 1];
                if (lastResult) {
                    for (const dmg of lastResult.damages) {
                        if (dmg.isHeal) {
                            rendererRef.current?.playHealEffect(dmg.targetId);
                        }
                    }
                }
                setTimeout(() => finalize(newState), 300);
                return;
            }

            if (!currentUnitId || !targetId) {
                const newState = handlePlayerAction(srcState, action);
                finalize(newState);
                return;
            }

            if (action.type === 'attack') {
                rendererRef.current?.playAttackAnimation(currentUnitId, targetId, () => {
                    const latestState = stateRef.current;
                    const newState = handlePlayerAction(latestState, action);
                    const lastResult = newState.turnResults[newState.turnResults.length - 1];
                    if (lastResult) {
                        for (const dmg of lastResult.damages) {
                            if (dmg.isHeal) {
                                rendererRef.current?.playHealEffect(dmg.targetId);
                            } else {
                                rendererRef.current?.playDamageEffect(dmg.targetId);
                            }
                        }
                    }
                    setTimeout(() => finalize(newState), 400);
                });
            } else if (action.type === 'magic') {
                rendererRef.current?.playMagicEffect(currentUnitId, targetId, () => {
                    const latestState = stateRef.current;
                    const newState = handlePlayerAction(latestState, action);
                    const lastResult = newState.turnResults[newState.turnResults.length - 1];
                    if (lastResult) {
                        for (const dmg of lastResult.damages) {
                            if (dmg.isHeal) {
                                rendererRef.current?.playHealEffect(dmg.targetId);
                            } else {
                                rendererRef.current?.playDamageEffect(dmg.targetId);
                            }
                        }
                    }
                    setTimeout(() => finalize(newState), 400);
                });
            }
        },
        [applyNewState]
    );

    const handleAttack = () => {
        setPendingAction({ type: 'attack' });
    };

    const handleMagic = (abilityId: string) => {
        const ability = currentAbilities.find((a) => a.id === abilityId);
        if (ability) {
            setPendingAction({ type: 'magic', ability });
        }
    };

    const handleDefend = () => {
        if (!currentUnit) return;
        performAction({
            type: 'defend',
            sourceId: currentUnit.id,
            targetIds: [currentUnit.id],
        });
    };

    const handleItem = (itemId: string) => {
        setPendingAction({ type: 'item', itemId });
    };

    const handleTargetSelect = (targetId: string) => {
        if (!pendingAction || !currentUnit) return;

        let action: CombatAction;

        switch (pendingAction.type) {
            case 'attack':
                action = {
                    type: 'attack',
                    sourceId: currentUnit.id,
                    targetIds: [targetId],
                };
                break;
            case 'magic':
                action = {
                    type: 'magic',
                    sourceId: currentUnit.id,
                    targetIds: [targetId],
                    abilityId: pendingAction.ability.id,
                };
                break;
            case 'item':
                action = {
                    type: 'item',
                    sourceId: currentUnit.id,
                    targetIds: [targetId],
                    itemId: pendingAction.itemId,
                };
                break;
        }

        setPendingAction(null);
        performAction(action);
    };

    const handleTargetSelectAll = () => {
        if (!pendingAction || !currentUnit) return;
        if (pendingAction.type !== 'magic') return;

        const ability = pendingAction.ability;
        const isAlly = ability.targetType === 'all_allies';
        const targets = combatState.units
            .filter((u) => (isAlly ? u.isPlayer : !u.isPlayer) && u.isAlive)
            .map((u) => u.id);

        const action: CombatAction = {
            type: 'magic',
            sourceId: currentUnit.id,
            targetIds: targets,
            abilityId: ability.id,
        };

        setPendingAction(null);
        performAction(action);
    };

    // Determine target selector
    const getTargetSelectorProps = () => {
        if (!pendingAction) return null;

        if (pendingAction.type === 'attack') {
            return {
                targets: viewState.enemyUnits,
                isAllyTarget: false,
                selectAll: false,
            };
        }

        if (pendingAction.type === 'magic') {
            const ability = pendingAction.ability;
            const isAlly =
                ability.targetType === 'single_ally' ||
                ability.targetType === 'all_allies';
            const isAll =
                ability.targetType === 'all_enemies' ||
                ability.targetType === 'all_allies';
            return {
                targets: isAlly ? viewState.playerUnits : viewState.enemyUnits,
                isAllyTarget: isAlly,
                selectAll: isAll,
            };
        }

        if (pendingAction.type === 'item') {
            // Items target allies
            const item = combatState.inventory.find(
                (i) => i.item.id === pendingAction.itemId
            )?.item;
            const isRevive = item?.effectType === 'revive';
            const targets = viewState.playerUnits.filter(
                (u) => (isRevive ? !u.isAlive : u.isAlive)
            );
            return {
                targets,
                isAllyTarget: true,
                selectAll: false,
            };
        }

        return null;
    };

    const targetProps = getTargetSelectorProps();
    const showResult =
        combatState.phase === 'victory' || combatState.phase === 'defeat';

    return (
        <div className="battle-screen">
            <div className="battle-screen__canvas-wrapper">
                <canvas ref={canvasRef} className="battle-screen__canvas" />

                {targetProps && (
                    <TargetSelector
                        targets={targetProps.targets}
                        isAllyTarget={targetProps.isAllyTarget}
                        selectAll={targetProps.selectAll}
                        onSelect={handleTargetSelect}
                        onSelectAll={handleTargetSelectAll}
                        onCancel={() => setPendingAction(null)}
                    />
                )}

                {showResult && (
                    <BattleResult
                        isVictory={combatState.phase === 'victory'}
                        onRetry={onRetry}
                        onMenu={onMenu}
                    />
                )}
            </div>

            <div className="battle-screen__bottom">
                <div className="battle-screen__hud-row">
                    {viewState.playerUnits.map((unit) => (
                        <UnitHUD key={unit.id} unit={unit} />
                    ))}
                    <div style={{ width: '20px', flexShrink: 0 }} />
                    {viewState.enemyUnits.map((unit) => (
                        <UnitHUD key={unit.id} unit={unit} />
                    ))}
                </div>

                <div className="battle-screen__controls">
                    <ActionPanel
                        unitName={viewState.currentUnit?.name ?? '...'}
                        abilities={currentAbilities}
                        unitMp={currentUnit?.mp ?? 0}
                        inventory={viewState.inventory}
                        onAttack={handleAttack}
                        onMagic={handleMagic}
                        onDefend={handleDefend}
                        onItem={handleItem}
                        disabled={!viewState.canAct || isAnimating}
                    />

                    <div className="battle-log" ref={logRef}>
                        <div className="battle-log__title">Battle Log</div>
                        {viewState.log.map((entry, i) => (
                            <div key={i} className="battle-log__entry">
                                {entry}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
