import {  describe,  it,  expect,  vi } from 'vitest';
import { luckysheet_compareWith } from './compareWith';

vi.mock('../../global/func_methods', () => ({
    default: {
        getCellDataDyadicArr: vi.fn((data, type) => {
            if (type === 'text') return [[data.startCell]];
            return [[data]];
        }),
        isDyadicArr: vi.fn((arr) => {
            if (!Array.isArray(arr) || arr.length === 0) return false;
            const len = arr[0].length;
            return arr.every(row => Array.isArray(row) && row.length === len);
        }),
    },
}));

vi.mock('../../global/validate', () => ({
    isRealNum: vi.fn((v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== '')),
    valueIsError: vi.fn((v) => {
        if (typeof v !== 'string') return false;
        const errors = ['#VALUE!', '#NAME?', '#N/A', '#REF!', '#DIV/0!', '#NUM!', '#NULL!', '#SPILL!'];
        return errors.includes(v);
    }),
    error: { v: '#VALUE!', d: '#DIV/0!', na: '#N/A', r: '#REF!' },
}));

vi.mock('../../utils/util', () => ({
    getObjType: vi.fn((v) => {
        if (v === null) return 'null';
        if (Array.isArray(v)) return 'array';
        return typeof v;
    }),
}));

describe('luckysheet_compareWith', () => {
    it('两数相加', () => {
        expect(luckysheet_compareWith(3, '+', 4)).toBeCloseTo(7);
    });

    it('两数相减', () => {
        expect(luckysheet_compareWith(10, '-', 3)).toBeCloseTo(7);
    });

    it('两数相乘', () => {
        expect(luckysheet_compareWith(3, '*', 4)).toBeCloseTo(12);
    });

    it('两数相除', () => {
        expect(luckysheet_compareWith(10, '/', 2)).toBeCloseTo(5);
    });

    it('幂运算', () => {
        expect(luckysheet_compareWith(2, '^', 3)).toBeCloseTo(8);
    });

    it('字符串连接 (&)', () => {
        expect(luckysheet_compareWith('hello', '&', 'world')).toBe('helloworld');
    });

    it('== 比较运算', () => {
        expect(luckysheet_compareWith(5, '==', 5)).toBe(true);
        expect(luckysheet_compareWith(5, '==', 3)).toBe(false);
    });

    it('> 比较运算', () => {
        expect(luckysheet_compareWith(10, '>', 5)).toBe(true);
        expect(luckysheet_compareWith(3, '>', 5)).toBe(false);
    });

    it('< 比较运算', () => {
        expect(luckysheet_compareWith(3, '<', 10)).toBe(true);
        expect(luckysheet_compareWith(10, '<', 3)).toBe(false);
    });

    it('= 作为 == 的别名', () => {
        expect(luckysheet_compareWith(5, '=', 5)).toBe(true);
        expect(luckysheet_compareWith(5, '=', 3)).toBe(false);
    });

    it('<> 作为 != 的别名', () => {
        expect(luckysheet_compareWith(5, '<>', 3)).toBe(true);
        expect(luckysheet_compareWith(5, '<>', 5)).toBe(false);
    });

    it('除以零返回 #DIV/0!', () => {
        expect(luckysheet_compareWith(10, '/', 0)).toBe('#DIV/0!');
    });

    it('除以 null 返回 #DIV/0!', () => {
        expect(luckysheet_compareWith(10, '/', null)).toBe('#DIV/0!');
    });

    it('减法中 null 视为 0', () => {
        expect(luckysheet_compareWith(null, '-', 5)).toBeCloseTo(-5);
    });

    it('两个操作数均为 null 时返回 #INVERSE!', () => {
        expect(luckysheet_compareWith(null, '+', null)).toBe('#INVERSE!');
    });

    it('取余运算', () => {
        expect(luckysheet_compareWith(10, '%', 3)).toBeCloseTo(1);
    });

    it('非数值算术运算返回 #VALUE!', () => {
        expect(luckysheet_compareWith('abc', '+', 2)).toBe('#VALUE!');
    });

    it('#INVERSE! 操作数翻转符号', () => {
        expect(luckysheet_compareWith('#INVERSE!', '+', 5)).toBeCloseTo(-5);
        expect(luckysheet_compareWith('#INVERSE!', '-', 5)).toBeCloseTo(5);
    });
});
