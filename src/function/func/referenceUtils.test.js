import { describe, it, expect, vi } from 'vitest';
import {
    luckysheet_indirect_check,
    luckysheet_indirect_check_return,
    luckysheet_offset_check,
    luckysheet_getSpecialReference,
} from './referenceUtils';

vi.mock('../../global/func_methods', () => ({
    default: {
        getFirstValue: vi.fn((v) => v),
    },
}));

vi.mock('../../global/validate', () => ({
    valueIsError: vi.fn((v) => typeof v === 'string' && v.startsWith('#')),
    isRealNum: vi.fn((v) => typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== '')),
    error: { v: '#VALUE!', d: '#DIV/0!', na: '#N/A', r: '#REF!' },
}));

vi.mock('../../utils/util', () => ({
    getObjType: vi.fn((v) => {
        if (v === null) return 'null';
        if (Array.isArray(v)) return 'array';
        return typeof v;
    }),
}));

vi.mock('../../methods/get', () => ({
    getRangetxt: vi.fn((_idx, range) => `A1:${String.fromCharCode(65 + range.column[1])}${range.row[1] + 1}`),
}));

vi.mock('../../global/formula', () => ({
    default: {
        error: { v: '#VALUE!', r: '#REF!' },
        getcellrange: vi.fn((ref) => ({
            row: [0, 0],
            column: [0, 0],
        })),
    },
}));

vi.mock('../../store', () => ({
    default: {
        calculateSheetIndex: 0,
        flowdata: Array.from({ length: 100 }, () => Array.from({ length: 26 }, () => ({}))),
    },
}));

vi.mock('./getCellData', () => ({
    luckysheet_getcelldata: vi.fn((txt) => ({ startCell: txt.split(':')[0], data: {} })),
}));

describe('luckysheet_indirect_check', () => {
    it('null 输入返回 null', () => {
        expect(luckysheet_indirect_check(null)).toBeNull();
    });

    it('空字符串返回 null', () => {
        expect(luckysheet_indirect_check('')).toBeNull();
    });

    it('有效输入返回单元格文本', () => {
        expect(luckysheet_indirect_check('A1')).toBe('A1');
    });
});

describe('luckysheet_indirect_check_return', () => {
    it('原样返回输入文本', () => {
        expect(luckysheet_indirect_check_return('Sheet1!A1')).toBe('Sheet1!A1');
    });
});

describe('luckysheet_offset_check', () => {
    it('第一个参数不是单元格引用时返回 #VALUE!', () => {
        expect(luckysheet_offset_check(5, 1, 1)).toBe('#VALUE!');
    });

    it('第一个参数对象无 startCell 属性时返回 #VALUE!', () => {
        expect(luckysheet_offset_check({ foo: 'bar' }, 1, 1)).toBe('#VALUE!');
    });

    it('有效偏移量返回范围文本', () => {
        const ref = { startCell: 'A1', rowl: 1, coll: 1 };
        const result = luckysheet_offset_check(ref, 1, 1);
        expect(result).toContain('A1');
    });

    it('行偏移不是数字时返回 #VALUE!', () => {
        const ref = { startCell: 'A1', rowl: 1, coll: 1 };
        expect(luckysheet_offset_check(ref, 'abc', 1)).toBe('#VALUE!');
    });

    it('列偏移不是数字时返回 #VALUE!', () => {
        const ref = { startCell: 'A1', rowl: 1, coll: 1 };
        expect(luckysheet_offset_check(ref, 1, 'abc')).toBe('#VALUE!');
    });

    it('高度小于 1 时返回 #REF!', () => {
        const ref = { startCell: 'A1', rowl: 1, coll: 1 };
        expect(luckysheet_offset_check(ref, 0, 0, 0)).toBe('#REF!');
    });

    it('宽度小于 1 时返回 #REF!', () => {
        const ref = { startCell: 'A1', rowl: 1, coll: 1 };
        expect(luckysheet_offset_check(ref, 0, 0, 1, 0)).toBe('#REF!');
    });
});

describe('luckysheet_getSpecialReference', () => {
    it('functionRange 的 startCell 含冒号时返回 #VALUE!', () => {
        const result = luckysheet_getSpecialReference(
            true,
            'A1',
            { startCell: 'A1:B2' }
        );
        expect(result).toBe('#VALUE!');
    });

    it('rangeTxt 含冒号时返回 #VALUE!', () => {
        const result = luckysheet_getSpecialReference(
            true,
            'A1:B2',
            { startCell: 'A1' }
        );
        expect(result).toBe('#VALUE!');
    });
});
