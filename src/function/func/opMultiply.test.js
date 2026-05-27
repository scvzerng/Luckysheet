import { describe, it, expect } from 'vitest';
import { handleMultiply } from './opMultiply';

describe('handleMultiply', () => {
    it('两个标量相乘', () => {
        expect(handleMultiply(3, 4, '*')).toBeCloseTo(12);
    });

    it('标量乘零', () => {
        expect(handleMultiply(5, 0, '*')).toBeCloseTo(0);
    });

    it('负数相乘', () => {
        expect(handleMultiply(-3, 4, '*')).toBeCloseTo(-12);
        expect(handleMultiply(-3, -4, '*')).toBeCloseTo(12);
    });

    it('一维数组逐元素相乘', () => {
        const result = handleMultiply([1, 2, 3], [4, 5, 6], '*');
        expect(result).toHaveLength(3);
        expect(result[0]).toBeCloseTo(4);
        expect(result[1]).toBeCloseTo(10);
        expect(result[2]).toBeCloseTo(18);
    });

    it('二维数组逐元素相乘（相同维度）', () => {
        const fp = [[1, 2], [3, 4]];
        const tp = [[5, 6], [7, 8]];
        const result = handleMultiply(fp, tp, '*');
        expect(result).toHaveLength(2);
        expect(result[0][0]).toBeCloseTo(5);
        expect(result[0][1]).toBeCloseTo(12);
        expect(result[1][0]).toBeCloseTo(21);
        expect(result[1][1]).toBeCloseTo(32);
    });

    it('二维数组乘标量', () => {
        const fp = [[1, 2], [3, 4]];
        const result = handleMultiply(fp, 10, '*');
        expect(result[0][0]).toBeCloseTo(10);
        expect(result[0][1]).toBeCloseTo(20);
        expect(result[1][0]).toBeCloseTo(30);
        expect(result[1][1]).toBeCloseTo(40);
    });

    it('标量乘二维数组', () => {
        const tp = [[1, 2], [3, 4]];
        const result = handleMultiply(10, tp, '*');
        expect(result[0][0]).toBeCloseTo(10);
        expect(result[0][1]).toBeCloseTo(20);
        expect(result[1][0]).toBeCloseTo(30);
        expect(result[1][1]).toBeCloseTo(40);
    });

    it('二维数组矩阵乘法（m*p x p*n）', () => {
        const fp = [[1, 2], [3, 4]];
        const tp = [[5, 6], [7, 8]];
        const result = handleMultiply(fp, tp, '*');
        expect(result[0][0]).toBeCloseTo(5);
        expect(result[0][1]).toBeCloseTo(12);
        expect(result[1][0]).toBeCloseTo(21);
        expect(result[1][1]).toBeCloseTo(32);
    });

    it('非数值输入返回 #VALUE!', () => {
        const result = handleMultiply('abc', 2, '*');
        expect(result).toBe('#VALUE!');
    });

    it('布尔 true 乘法前转换为 1', () => {
        const result = handleMultiply(true, 5, '*');
        expect(result).toBeCloseTo(5);
    });

    it('布尔 false 乘法前转换为 0', () => {
        const result = handleMultiply(false, 5, '*');
        expect(result).toBeCloseTo(0);
    });
});
