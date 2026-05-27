import { describe, it, expect } from 'vitest';
import { jfnqrt } from './matrixCalcOperation';

describe('matrixCalcOperation - 矩阵计算', () => {
    describe('jfnqrt', () => {
        it('0的任意次方根应为0', () => {
            expect(jfnqrt(0, 2)).toBe(0);
            expect(jfnqrt(0, 3)).toBe(0);
        });

        it('1的任意次方根应为1', () => {
            expect(jfnqrt(1, 2)).toBeCloseTo(1, 5);
            expect(jfnqrt(1, 3)).toBeCloseTo(1, 5);
        });

        it('应正确计算平方根', () => {
            expect(jfnqrt(4, 2)).toBeCloseTo(2, 5);
            expect(jfnqrt(9, 2)).toBeCloseTo(3, 5);
            expect(jfnqrt(16, 2)).toBeCloseTo(4, 5);
        });

        it('应正确计算立方根', () => {
            expect(jfnqrt(8, 3)).toBeCloseTo(2, 5);
            expect(jfnqrt(27, 3)).toBeCloseTo(3, 5);
        });

        it('应正确计算高次方根', () => {
            expect(jfnqrt(32, 5)).toBeCloseTo(2, 5);
            expect(jfnqrt(1024, 10)).toBeCloseTo(2, 4);
        });

        it('应正确处理小数', () => {
            expect(jfnqrt(0.25, 2)).toBeCloseTo(0.5, 5);
        });
    });
});
