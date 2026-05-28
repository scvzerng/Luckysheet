import type { ConditionName } from '../../shared/types/index.js';
import type { ConditionStrategy } from './ConditionStrategy.js';
import {
    GreaterThanCondition,
    LessThanCondition,
    EqualCondition,
    TextContainsCondition,
    BetweennessCondition,
    RegExpCondition,
    SortCondition,
} from './builtinConditions.js';

const registry = new Map<ConditionName, ConditionStrategy>();

export function registerCondition(condition: ConditionStrategy): void {
    registry.set(condition.name, condition);
}

export function getCondition(name: ConditionName): ConditionStrategy | undefined {
    return registry.get(name);
}

export function hasCondition(name: string): boolean {
    return registry.has(name as ConditionName);
}

export function getConditionNames(): string[] {
    return [...registry.keys()];
}

registerCondition(new GreaterThanCondition());
registerCondition(new LessThanCondition());
registerCondition(new EqualCondition());
registerCondition(new TextContainsCondition());
registerCondition(new BetweennessCondition());
registerCondition(new RegExpCondition());
registerCondition(new SortCondition());
