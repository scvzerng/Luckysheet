import { describe, it, expect } from 'vitest';
import { handleAddSubMod } from './opAddSubMod';

describe('handleAddSubMod', () => {
    describe('加法 (+)', () => {
        it('两个标量相加', () => {
            expect(handleAddSubMod(3, 4, '+')).toBeCloseTo(7);
        });

        it('负数相加', () => {
            expect(handleAddSubMod(-3, 4, '+')).toBeCloseTo(1);
        });

        it('一维数组逐元素相加', () => {
            const result = handleAddSubMod([1, 2, 3], [4, 5, 6], '+');
            expect(result).toHaveLength(3);
            expect(result[0]).toBeCloseTo(5);
            expect(result[1]).toBeCloseTo(7);
            expect(result[2]).toBeCloseTo(9);
        });

        it('二维数组加标量', () => {
            const fp = [[1, 2], [3, 4]];
            const result = handleAddSubMod(fp, 10, '+');
            expect(result[0][0]).toBeCloseTo(11);
            expect(result[0][1]).toBeCloseTo(12);
            expect(result[1][0]).toBeCloseTo(13);
            expect(result[1][1]).toBeCloseTo(14);
        });
    });

    describe('减法 (-)', () => {
        it('两个标量相减', () => {
            expect(handleAddSubMod(10, 3, '-')).toBeCloseTo(7);
        });

        it('一维数组逐元素相减', () => {
            const result = handleAddSubMod([10, 20], [3, 5], '-');
            expect(result[0]).toBeCloseTo(7);
            expect(result[1]).toBeCloseTo(15);
        });
    });

    describe('取余 (%)', () => {
        it('两个标量取余', () => {
            expect(handleAddSubMod(10, 3, '%')).toBeCloseTo(1);
        });

        it('对零取余返回 #DIV/0!', () => {
            expect(handleAddSubMod(10, 0, '%')).toBe('#DIV/0!');
        });

        it('一维数组逐元素取余', () => {
            const result = handleAddSubMod([10, 15], [3, 4], '%');
            expect(result[0]).toBeCloseTo(1);
            expect(result[1]).toBeCloseTo(3);
        });

        it('取余数组中含零元素返回 #DIV/0!', () => {
            const result = handleAddSubMod([10, 15], [0, 4], '%');
            expect(result[0]).toBe('#DIV/0!');
            expect(result[1]).toBeCloseTo(3);
        });
    });

    it('非数值标量输入返回 #VALUE!', () => {
        expect(handleAddSubMod('abc', 2, '+')).toBe('#VALUE!');
    });

    it('布尔 true 运算前转换为 1', () => {
        expect(handleAddSubMod(true, 5, '+')).toBeCloseTo(6);
    });

    it('布尔 false 运算前转换为 0', () => {
        expect(handleAddSubMod(false, 5, '+')).toBeCloseTo(5);
    });
});
