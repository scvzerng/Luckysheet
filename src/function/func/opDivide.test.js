import { describe, it, expect } from 'vitest';
import { handleDivide } from './opDivide';

describe('handleDivide', () => {
    it('两个标量相除', () => {
        expect(handleDivide(10, 2, '/')).toBeCloseTo(5);
    });

    it('除以零标量返回 #DIV/0!', () => {
        expect(handleDivide(10, 0, '/')).toBe('#DIV/0!');
    });

    it('负数相除', () => {
        expect(handleDivide(-10, 2, '/')).toBeCloseTo(-5);
        expect(handleDivide(10, -2, '/')).toBeCloseTo(-5);
    });

    it('一维数组逐元素相除', () => {
        const result = handleDivide([10, 20, 30], [2, 5, 6], '/');
        expect(result).toHaveLength(3);
        expect(result[0]).toBeCloseTo(5);
        expect(result[1]).toBeCloseTo(4);
        expect(result[2]).toBeCloseTo(5);
    });

    it('除数数组中含零元素返回 #DIV/0!', () => {
        const result = handleDivide([10, 20], [2, 0], '/');
        expect(result[0]).toBeCloseTo(5);
        expect(result[1]).toBe('#DIV/0!');
    });

    it('二维数组除以标量', () => {
        const fp = [[10, 20], [30, 40]];
        const result = handleDivide(fp, 10, '/');
        expect(result[0][0]).toBeCloseTo(1);
        expect(result[0][1]).toBeCloseTo(2);
        expect(result[1][0]).toBeCloseTo(3);
        expect(result[1][1]).toBeCloseTo(4);
    });

    it('标量除以二维数组', () => {
        const tp = [[2, 5], [10, 20]];
        const result = handleDivide(100, tp, '/');
        expect(result[0][0]).toBeCloseTo(50);
        expect(result[0][1]).toBeCloseTo(20);
        expect(result[1][0]).toBeCloseTo(10);
        expect(result[1][1]).toBeCloseTo(5);
    });

    it('非数值输入返回 #VALUE!', () => {
        const result = handleDivide('abc', 2, '/');
        expect(result).toBe('#VALUE!');
    });

    it('二维数组逐元素相除（相同维度）', () => {
        const fp = [[10, 20], [30, 40]];
        const tp = [[2, 4], [5, 8]];
        const result = handleDivide(fp, tp, '/');
        expect(result[0][0]).toBeCloseTo(5);
        expect(result[0][1]).toBeCloseTo(5);
        expect(result[1][0]).toBeCloseTo(6);
        expect(result[1][1]).toBeCloseTo(5);
    });
});
