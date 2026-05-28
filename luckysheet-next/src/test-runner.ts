import { ComputeEngine, ConditionRule, Cell, CellRange, ICON_FORMAT_MAP } from './index.js';
import type { RawRuleObject } from './shared/types/index.js';

export function runTests(): boolean {
    const results: { name: string; passed: boolean }[] = [];

    function test(name: string, fn: () => boolean): void {
        try {
            const passed = fn();
            results.push({ name, passed });
            console.log(`${passed ? '✅' : '❌'} ${name}`);
        } catch (e) {
            results.push({ name, passed: false });
            console.log(`❌ ${name}: ${e}`);
        }
    }

    function makeData(values: number[][]): unknown[][] {
        return values.map(row =>
            row.map(v => ({
                v,
                m: String(v),
                ct: { fa: 'General', t: 'n' },
            }))
        );
    }

    const engine = new ComputeEngine();

    test('Cell - isNumber', () => {
        const cell = new Cell(0, 0, { v: 42, ct: { fa: 'General', t: 'n' } });
        return cell.isNumber && cell.value === 42;
    });

    test('Cell - exists with null', () => {
        const cell = new Cell(0, 0, null);
        return !cell.exists;
    });

    test('Cell - key', () => {
        const cell = new Cell(3, 5, { v: 1, ct: { fa: 'General', t: 'n' } });
        return cell.key === '3_5';
    });

    test('CellRange - getStatistics', () => {
        const data = makeData([[10, 20, 30]]);
        const range = new CellRange([{ row: [0, 0], column: [0, 2] }], data);
        const stats = range.getStatistics();
        return stats.min === 10 && stats.max === 30 && stats.avg === 20;
    });

    test('ComputeEngine - greaterThan', () => {
        const data = makeData([[10, 50, 90]]);
        const rules: RawRuleObject[] = [{
            type: 'default',
            cellrange: [{ row: [0, 0], column: [0, 2] }],
            format: { textColor: '#9c0006', cellColor: '#ffc7ce' },
            conditionName: 'greaterThan',
            conditionRange: [],
            conditionValue: [40],
        }];
        const result = engine.compute(rules, data);
        const map = result.toObject();
        return '0_1' in map && '0_2' in map && !('0_0' in map);
    });

    test('ComputeEngine - lessThan', () => {
        const data = makeData([[10, 50, 90]]);
        const rules: RawRuleObject[] = [{
            type: 'default',
            cellrange: [{ row: [0, 0], column: [0, 2] }],
            format: { textColor: '#000', cellColor: '#ff0' },
            conditionName: 'lessThan',
            conditionRange: [],
            conditionValue: [40],
        }];
        const result = engine.compute(rules, data);
        const map = result.toObject();
        return '0_0' in map && !('0_2' in map);
    });

    test('ComputeEngine - equal', () => {
        const data = makeData([[10, 50, 90]]);
        const rules: RawRuleObject[] = [{
            type: 'default',
            cellrange: [{ row: [0, 0], column: [0, 2] }],
            format: { textColor: '#000', cellColor: '#ff0' },
            conditionName: 'equal',
            conditionRange: [],
            conditionValue: [50],
        }];
        const result = engine.compute(rules, data);
        const map = result.toObject();
        return '0_1' in map && !('0_0' in map) && !('0_2' in map);
    });

    test('ComputeEngine - betweenness', () => {
        const data = makeData([[10, 50, 90]]);
        const rules: RawRuleObject[] = [{
            type: 'default',
            cellrange: [{ row: [0, 0], column: [0, 2] }],
            format: { textColor: '#000', cellColor: '#ff0' },
            conditionName: 'betweenness',
            conditionRange: [],
            conditionValue: [20, 60],
        }];
        const result = engine.compute(rules, data);
        const map = result.toObject();
        return '0_1' in map && !('0_0' in map) && !('0_2' in map);
    });

    test('ComputeEngine - dataBar', () => {
        const data = makeData([[10, 50, 90]]);
        const rules: RawRuleObject[] = [{
            type: 'dataBar',
            cellrange: [{ row: [0, 0], column: [0, 2] }],
            format: ['#638ec6', '#ffffff'],
        }];
        const result = engine.compute(rules, data);
        const map = result.toObject();
        return '0_0' in map && map['0_0'].dataBar != null;
    });

    test('ComputeEngine - colorGradation', () => {
        const data = makeData([[10, 50, 90]]);
        const rules: RawRuleObject[] = [{
            type: 'colorGradation',
            cellrange: [{ row: [0, 0], column: [0, 2] }],
            format: ['rgb(99, 190, 123)', 'rgb(255, 235, 132)', 'rgb(248, 105, 107)'],
        }];
        const result = engine.compute(rules, data);
        const map = result.toObject();
        return '0_0' in map && map['0_0'].cellColor != null;
    });

    test('ComputeEngine - icons', () => {
        const data = makeData([[10, 50, 90]]);
        const rules: RawRuleObject[] = [{
            type: 'icons',
            cellrange: [{ row: [0, 0], column: [0, 2] }],
            format: ICON_FORMAT_MAP.threeWayArrowMultiColor,
        }];
        const result = engine.compute(rules, data);
        const map = result.toObject();
        return '0_0' in map && map['0_0'].icons != null;
    });

    test('ConditionRule - toRaw/fromRaw roundtrip', () => {
        const rule = ConditionRule.createDefault({
            conditionName: 'greaterThan',
            conditionValue: [50],
            conditionRange: [],
            format: { textColor: '#000', cellColor: '#ff0' },
            cellRange: [{ row: [0, 5], column: [0, 5] }],
        });
        const raw = rule.toRaw();
        const restored = ConditionRule.fromRaw(raw);
        return restored.type === 'default'
            && restored.conditionName === 'greaterThan'
            && restored.conditionValue![0] === 50;
    });

    test('ICON_FORMAT_MAP - has 20 entries', () => {
        return Object.keys(ICON_FORMAT_MAP).length === 20;
    });

    test('ComputeResult - get returns null for missing', () => {
        const result = engine.compute([], makeData([[1]]));
        return result.get(99, 99) === null;
    });

    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    console.log(`\n${passed}/${total} tests passed`);
    return passed === total;
}
