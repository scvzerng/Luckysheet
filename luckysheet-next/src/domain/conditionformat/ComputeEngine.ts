import { ComputeResult } from './ComputeResult.js';
import { ConditionRule } from './ConditionRule.js';
import { CellRange } from '../cell/CellRange.js';
import { Cell } from '../cell/Cell.js';
import { getCondition } from './conditions/ConditionRegistry.js';
import { ICON_FORMAT_MAP } from './iconFormats.js';
import type { DataBarStyle } from '../../shared/types/index.js';

export class ComputeEngine {
    compute(rules: RawRuleLike[], data: unknown[][]): ComputeResult {
        if (rules == null) return new ComputeResult();

        const result = new ComputeResult();
        for (let i = 0; i < rules.length; i++) {
            const rule = ConditionRule.fromRaw(rules[i] as any);
            const cellRange = new CellRange(rule.cellRange, data);
            this._computeRule(rule, cellRange, data, result);
        }
        return result;
    }

    private _computeRule(rule: ConditionRule, cellRange: CellRange, data: unknown[][], result: ComputeResult): void {
        switch (rule.type) {
            case 'dataBar':
                this._computeDataBar(rule, cellRange, result);
                break;
            case 'colorGradation':
                this._computeColorGradation(rule, cellRange, result);
                break;
            case 'icons':
                this._computeIcons(rule, cellRange, result);
                break;
            default:
                this._computeDefault(rule, cellRange, data, result);
                break;
        }
    }

    private _computeDefault(rule: ConditionRule, cellRange: CellRange, data: unknown[][], result: ComputeResult): void {
        const condition = getCondition(rule.conditionName as any);
        if (!condition) return;

        const format = rule.format as { textColor: string; cellColor: string };
        for (const cell of cellRange.eachExistingCell()) {
            if (condition.matches(cell, rule.conditionValue ?? [])) {
                result.setColor(cell, format.textColor, format.cellColor);
            }
        }
    }

    private _computeDataBar(rule: ConditionRule, cellRange: CellRange, result: ComputeResult): void {
        const { min, max } = cellRange.getStatistics();
        if (min === null || max === null) return;

        const hasNegative = min < 0;
        const plusLen = hasNegative ? Math.round(max / (max - min) * 10) / 10 : 1;
        const minusLen = hasNegative ? Math.round(Math.abs(min) / (max - min) * 10) / 10 : 0;
        const format = rule.format as string[];

        for (const cell of cellRange.eachNumericCell()) {
            const v = cell.numericValue()!;
            if (hasNegative && v < 0) {
                const valueLen = Math.round(Math.abs(v) / Math.abs(min) * 100) / 100;
                result.setDataBar(cell, { valueType: 'minus', minusLen, valueLen, format });
            } else {
                const valueLen = max === 0 ? 1 : Math.round(v / max * 100) / 100;
                result.setDataBar(cell, { valueType: 'plus', plusLen, minusLen, valueLen, format });
            }
        }
    }

    private _computeColorGradation(rule: ConditionRule, cellRange: CellRange, result: ComputeResult): void {
        const { min, max, avg } = cellRange.getStatistics();
        if (min === null || max === null) return;
        const format = rule.format as string[];

        for (const cell of cellRange.eachNumericCell()) {
            const v = cell.numericValue()!;
            let color: string;
            if (format.length === 3) {
                if (v === min) color = format[2];
                else if (v === avg) color = format[1];
                else if (v === max) color = format[0];
                else if (v > min && v < avg) color = this._interpolateColor(format[2], format[1], min, avg!, v);
                else color = this._interpolateColor(format[1], format[0], avg!, max, v);
            } else {
                if (v === min) color = format[1];
                else if (v === max) color = format[0];
                else color = this._interpolateColor(format[1], format[0], min, max, v);
            }
            result.setCellColor(cell, color);
        }
    }

    private _computeIcons(rule: ConditionRule, cellRange: CellRange, result: ComputeResult): void {
        const { min, max } = cellRange.getStatistics();
        if (min === null || max === null) return;

        const format = rule.format as { len: number; leftMin: number; top: number };
        const len = format.len;
        const leftMin = format.leftMin;
        const top = format.top;

        const ranges = this._computeIconRanges(min, max, len);
        for (const cell of cellRange.eachNumericCell()) {
            const v = cell.numericValue()!;
            for (let idx = 0; idx < ranges.length; idx++) {
                const [lo, hi] = ranges[idx];
                if (v >= lo && v <= hi) {
                    result.setIcons(cell, { left: leftMin + (len - 1 - idx), top });
                    break;
                }
            }
        }
    }

    private _computeIconRanges(min: number, max: number, len: number): [number, number][] {
        const a = Math.floor((max - min + 1) / len);
        const b = (max - min + 1) % len;
        const ranges: [number, number][] = [];
        let cursor = min;
        for (let i = 0; i < len; i++) {
            const size = a + (i < b ? 1 : 0);
            ranges.push([cursor, cursor + size - 1]);
            cursor += size;
        }
        return ranges;
    }

    private _interpolateColor(color1: string, color2: string, value1: number, value2: number, value: number): string {
        const parse = (c: string) => {
            const rgb = c.replace(/rgb\(|\)/g, '').split(',').map(s => parseInt(s.trim()));
            return { r: rgb[0], g: rgb[1], b: rgb[2] };
        };
        const c1 = parse(color1);
        const c2 = parse(color2);
        const ratio = (value1 - value) / (value1 - value2);
        const r = Math.round(c1.r - (c1.r - c2.r) * ratio);
        const g = Math.round(c1.g - (c1.g - c2.g) * ratio);
        const b = Math.round(c1.b - (c1.b - c2.b) * ratio);
        return `rgb(${r}, ${g}, ${b})`;
    }
}

interface RawRuleLike {
    type: string;
    cellrange: any[];
    format: any;
    conditionName?: string;
    conditionRange?: any[];
    conditionValue?: any[];
}
