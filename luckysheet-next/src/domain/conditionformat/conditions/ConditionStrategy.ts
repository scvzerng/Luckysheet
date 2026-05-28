import type { ConditionName, ParseResult, RangeBoundary } from '../../shared/types/index.js';
import { Cell } from '../cell/Cell.js';

export abstract class ConditionStrategy {
    abstract get name(): ConditionName;

    parseValue(_conditionValue: unknown[], _ctx: ParseContext): ParseResult | null {
        return { conditionRange: [], conditionValue: _conditionValue };
    }

    matches(_cell: Cell, _conditionValue: unknown[]): boolean {
        return false;
    }

    getDisplayName(_conditionValue: unknown[], _conditionRange: RangeBoundary[], _localeText: Record<string, string>): string {
        return this.name;
    }

    validateValue(_conditionValue: unknown[]): boolean {
        return true;
    }
}

export interface ParseContext {
    data: unknown[][];
    conditionformat: any;
    localeText: Record<string, string>;
}
