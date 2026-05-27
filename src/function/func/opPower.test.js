import { describe, it, expect } from 'vitest';
import { handlePower } from './opPower';

describe('handlePower', () => {
    it('两个标量幂运算', () => {
        expect(handlePower(2, 3, '^')).toBeCloseTo(8);
    });

    it('指数 0.5 等效开平方', () => {
        expect(handlePower(4, 0.5, '^')).toBeCloseTo(2);
    });

    it('零次幂结果为 1', () => {
        expect(handlePower(5, 0, '^')).toBeCloseTo(1);
    });

    it('负底数幂运算', () => {
        expect(handlePower(-2, 3, '^')).toBeCloseTo(-8);
    });

    it('一维数组逐元素幂运算', () => {
        const result = handlePower([2, 3], [3, 2], '^');
        expect(result[0]).toBeCloseTo(8);
        expect(result[1]).toBeCloseTo(9);
    });

    it('二维数组逐元素幂运算', () => {
        const fp = [[2, 3], [4, 5]];
        const tp = [[2, 2], [2, 2]];
        const result = handlePower(fp, tp, '^');
        expect(result[0][0]).toBeCloseTo(4);
        expect(result[0][1]).toBeCloseTo(9);
        expect(result[1][0]).toBeCloseTo(16);
        expect(result[1][1]).toBeCloseTo(25);
    });

    it('二维数组对标量求幂', () => {
        const fp = [[2, 3], [4, 5]];
        const result = handlePower(fp, 2, '^');
        expect(result[0][0]).toBeCloseTo(4);
        expect(result[0][1]).toBeCloseTo(9);
        expect(result[1][0]).toBeCloseTo(16);
        expect(result[1][1]).toBeCloseTo(25);
    });

    it('标量对二维数组求幂', () => {
        const tp = [[2, 3], [4, 5]];
        const result = handlePower(2, tp, '^');
        expect(result[0][0]).toBeCloseTo(4);
        expect(result[0][1]).toBeCloseTo(8);
        expect(result[1][0]).toBeCloseTo(16);
        expect(result[1][1]).toBeCloseTo(32);
    });

    it('非数值输入返回 #VALUE!', () => {
        expect(handlePower('abc', 2, '^')).toBe('#VALUE!');
    });

    it('布尔 true 运算前转换为 1', () => {
        expect(handlePower(true, 3, '^')).toBeCloseTo(1);
    });

    it('布尔 false 运算前转换为 0', () => {
        expect(handlePower(false, 3, '^')).toBeCloseTo(0);
    });
});
