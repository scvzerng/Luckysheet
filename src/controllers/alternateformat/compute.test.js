import { describe, it, expect, vi } from 'vitest';

vi.mock('../../store', () => ({
    default: {
        currentSheetIndex: 0,
        luckysheetfile: [{ luckysheet_alternateformat_save: [] }],
    },
}));

vi.mock('../../methods/get', () => ({
    getSheetIndex: vi.fn(() => 0),
}));

import { checksAF, compute, getComputeMap } from './compute';

describe('compute - 计算引擎', () => {
    describe('checksAF', () => {
        it('单元格在映射中时应返回对应的颜色对象', () => {
            const computeMap = { '1_2': { fc: '#000', bc: '#fff' } };
            const result = checksAF(1, 2, computeMap);
            expect(result).toEqual({ fc: '#000', bc: '#fff' });
        });

        it('单元格不在映射中时应返回null', () => {
            const computeMap = { '1_2': { fc: '#000', bc: '#fff' } };
            const result = checksAF(3, 4, computeMap);
            expect(result).toBeNull();
        });

        it('空映射时应返回null', () => {
            const result = checksAF(0, 0, {});
            expect(result).toBeNull();
        });
    });

    describe('compute', () => {
        it('空规则数组应返回空映射', () => {
            const result = compute([]);
            expect(result).toEqual({});
        });

        it('null规则应返回空映射', () => {
            const result = compute(null);
            expect(result).toEqual({});
        });

        it('undefined规则应返回空映射', () => {
            const result = compute(undefined);
            expect(result).toEqual({});
        });
    });

    describe('getComputeMap', () => {
        it('应返回当前Sheet的交替颜色计算映射', () => {
            const result = getComputeMap();
            expect(typeof result).toBe('object');
        });
    });
});
