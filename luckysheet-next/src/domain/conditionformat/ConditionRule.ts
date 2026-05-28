import type { RuleType, RawRuleObject, RangeBoundary } from '../../shared/types/index.js';

export class ConditionRule {
    readonly type: RuleType;
    readonly cellRange: RangeBoundary[];
    readonly format: unknown;
    readonly conditionName?: string;
    readonly conditionRange?: RangeBoundary[];
    readonly conditionValue?: unknown[];

    private constructor(props: {
        type: RuleType;
        cellRange: RangeBoundary[];
        format: unknown;
        conditionName?: string;
        conditionRange?: RangeBoundary[];
        conditionValue?: unknown[];
    }) {
        this.type = props.type;
        this.cellRange = props.cellRange;
        this.format = props.format;
        this.conditionName = props.conditionName;
        this.conditionRange = props.conditionRange;
        this.conditionValue = props.conditionValue;
    }

    static createDefault(props: {
        conditionName: string;
        conditionValue: unknown[];
        conditionRange: RangeBoundary[];
        format: unknown;
        cellRange: RangeBoundary[];
    }): ConditionRule {
        return new ConditionRule({
            type: 'default',
            cellRange: props.cellRange,
            format: props.format,
            conditionName: props.conditionName,
            conditionRange: props.conditionRange,
            conditionValue: props.conditionValue,
        });
    }

    static createDataBar(cellRange: RangeBoundary[], format: unknown): ConditionRule {
        return new ConditionRule({ type: 'dataBar', cellRange, format });
    }

    static createColorGradation(cellRange: RangeBoundary[], format: unknown): ConditionRule {
        return new ConditionRule({ type: 'colorGradation', cellRange, format });
    }

    static createIcons(cellRange: RangeBoundary[], format: unknown): ConditionRule {
        return new ConditionRule({ type: 'icons', cellRange, format });
    }

    toRaw(): RawRuleObject {
        const raw: RawRuleObject = {
            type: this.type,
            cellrange: this.cellRange,
            format: this.format,
        };
        if (this.type === 'default') {
            raw.conditionName = this.conditionName as any;
            raw.conditionRange = this.conditionRange;
            raw.conditionValue = this.conditionValue;
        }
        return raw;
    }

    static fromRaw(raw: RawRuleObject): ConditionRule {
        return new ConditionRule({
            type: raw.type,
            cellRange: raw.cellrange,
            format: raw.format,
            conditionName: raw.conditionName,
            conditionRange: raw.conditionRange,
            conditionValue: raw.conditionValue,
        });
    }
}
