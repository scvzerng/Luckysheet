import { ConditionStrategy } from './ConditionStrategy.js';
import { Cell } from '../../cell/Cell.js';

export class GreaterThanCondition extends ConditionStrategy {
    get name(): 'greaterThan' { return 'greaterThan'; }

    matches(cell: Cell, conditionValue: unknown[]): boolean {
        return cell.exists && cell.value! > conditionValue[0] as number;
    }

    getDisplayName(conditionValue: unknown[], conditionRange: any[], localeText: Record<string, string>): string {
        const v = conditionRange[0] != null ? this._formatRange(conditionRange[0]) : conditionValue[0];
        return `${localeText.cellValue} > ${v}`;
    }

    private _formatRange(range: any): string {
        return `R${range.row[0] + 1}C${range.column[0] + 1}`;
    }
}

export class LessThanCondition extends ConditionStrategy {
    get name(): 'lessThan' { return 'lessThan'; }

    matches(cell: Cell, conditionValue: unknown[]): boolean {
        return cell.exists && cell.value! < conditionValue[0] as number;
    }

    getDisplayName(conditionValue: unknown[], conditionRange: any[], localeText: Record<string, string>): string {
        const v = conditionRange[0] != null ? `R${conditionRange[0].row[0] + 1}` : conditionValue[0];
        return `${localeText.cellValue} < ${v}`;
    }
}

export class EqualCondition extends ConditionStrategy {
    get name(): 'equal' { return 'equal'; }

    matches(cell: Cell, conditionValue: unknown[]): boolean {
        return cell.exists && cell.value == conditionValue[0];
    }

    getDisplayName(conditionValue: unknown[], conditionRange: any[], localeText: Record<string, string>): string {
        const v = conditionRange[0] != null ? `R${conditionRange[0].row[0] + 1}` : conditionValue[0];
        return `${localeText.cellValue} = ${v}`;
    }
}

export class TextContainsCondition extends ConditionStrategy {
    get name(): 'textContains' { return 'textContains'; }

    matches(cell: Cell, conditionValue: unknown[]): boolean {
        return cell.exists && cell.value!.toString().indexOf(conditionValue[0] as string) !== -1;
    }
}

export class BetweennessCondition extends ConditionStrategy {
    get name(): 'betweenness' { return 'betweenness'; }

    matches(cell: Cell, conditionValue: unknown[]): boolean {
        if (!cell.exists) return false;
        const vBig = Math.max(conditionValue[0] as number, conditionValue[1] as number);
        const vSmall = Math.min(conditionValue[0] as number, conditionValue[1] as number);
        return cell.value! >= vSmall && cell.value! <= vBig;
    }
}

export class RegExpCondition extends ConditionStrategy {
    get name(): 'regExp' { return 'regExp'; }

    matches(cell: Cell, conditionValue: unknown[]): boolean {
        if (!cell.exists) return false;
        const re = new RegExp(conditionValue[0] as string);
        const flag = (conditionValue[1] ?? 1) as number;
        const ret = re.test(cell.value!.toString());
        return (flag === 1 && ret) || (flag === 0 && !ret);
    }
}

export class SortCondition extends ConditionStrategy {
    get name(): 'sort' { return 'sort'; }

    matches(cell: Cell, conditionValue: unknown[], _extra?: { data: unknown[][] }): boolean {
        if (!cell.exists || cell.row < 1) return false;
        if (!_extra?.data) return false;
        const aboveRow = _extra.data[cell.row - 1];
        if (!aboveRow) return false;
        const above = aboveRow[cell.col] as any;
        if (!above || above.v == null) return false;
        const isAsc = [0, 'asc', '0'].includes(conditionValue[0] as string | number);
        const isDesc = [1, '1', 'desc'].includes(conditionValue[0] as string | number);
        if (isAsc) return cell.value! > above.v;
        if (isDesc) return cell.value! < above.v;
        return false;
    }
}
