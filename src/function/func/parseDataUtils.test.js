import { describe, it, expect, vi } from 'vitest';
import { luckysheet_parseData, luckysheet_getValue } from './parseDataUtils';

vi.mock('../../global/validate', () => ({
    valueIsError: vi.fn((v) => typeof v === 'string' && v.startsWith('#')),
    error: { v: '#VALUE!' },
}));

vi.mock('../../global/format', () => ({
    genarate: vi.fn((v) => {
        if (typeof v === 'string' && v.includes('-')) return [v, true, parseFloat(v) || v];
        return [v, false, v];
    }),
}));

vi.mock('../../global/formula', () => ({
    default: {
        isCompareOperator: vi.fn((v) => ({
            flag: typeof v === 'string' && ['>', '<', '=', '>=', '<=', '<>'].some(op => v.startsWith(op)),
        })),
    },
}));

describe('luckysheet_parseData', () => {
    it('null 返回空字符串', () => {
        expect(luckysheet_parseData(null)).toBe('');
    });

    it('无 v 属性的单元格对象返回空字符串', () => {
        expect(luckysheet_parseData({ data: { } })).toBe('');
    });

    it('单单元格对象返回 v 属性值', () => {
        expect(luckysheet_parseData({ data: { v: 42 } })).toBe(42);
    });

    it('单元格区域（数组数据）返回 #VALUE!', () => {
        expect(luckysheet_parseData({ data: [[1, 2]] })).toBe('#VALUE!');
    });

    it('数组（函数返回值）取第一个元素', () => {
        expect(luckysheet_parseData(['value', true])).toBe('value');
    });

    it('比较运算符字符串原样返回', () => {
        expect(luckysheet_parseData('>5')).toBe('>5');
    });

    it('数字原样返回', () => {
        expect(luckysheet_parseData(42)).toBe(42);
    });
});

describe('luckysheet_getValue', () => {
    it('将 null 解析为空字符串', () => {
        const args = [null];
        luckysheet_getValue(args);
        expect(args[0]).toBe('');
    });

    it('将单单元格对象解析为其值', () => {
        const args = [{ data: { v: 42 } }];
        luckysheet_getValue(args);
        expect(args[0]).toBe(42);
    });

    it('将单元格区域解析为数据数组', () => {
        const dataArr = [[1, 2], [3, 4]];
        const args = [{ data: dataArr }];
        luckysheet_getValue(args);
        expect(args[0]).toBe(dataArr);
    });

    it('将空单元格解析为空字符串', () => {
        const args = [{ data: {} }];
        luckysheet_getValue(args);
        expect(args[0]).toBe('');
    });

    it('处理多个参数', () => {
        const args = [null, { data: { v: 10 } }];
        luckysheet_getValue(args);
        expect(args[0]).toBe('');
        expect(args[1]).toBe(10);
    });
});
