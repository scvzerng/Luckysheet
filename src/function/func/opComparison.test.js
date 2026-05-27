import { describe, it, expect } from 'vitest';
import { handleComparison } from './opComparison';

describe('handleComparison', () => {
    describe('== 运算符', () => {
        it('相等标量比较', () => {
            expect(handleComparison(5, 5, '==')).toBe(true);
        });

        it('不等标量比较', () => {
            expect(handleComparison(5, 3, '==')).toBe(false);
        });

        it('一维数组逐元素比较', () => {
            const result = handleComparison([1, 2, 3], [1, 5, 3], '==');
            expect(result).toEqual([true, false, true]);
        });

        it('二维数组逐元素比较', () => {
            const fp = [[1, 2], [3, 4]];
            const tp = [[1, 0], [3, 0]];
            const result = handleComparison(fp, tp, '==');
            expect(result).toEqual([[true, false], [true, false]]);
        });

        it('标量与一维数组比较', () => {
            const result = handleComparison(2, [1, 2, 3], '==');
            expect(result).toEqual([false, true, false]);
        });
    });

    describe('!= 运算符', () => {
        it('不同值返回 true', () => {
            expect(handleComparison(1, 2, '!=')).toBe(true);
        });

        it('相同值返回 false', () => {
            expect(handleComparison(5, 5, '!=')).toBe(false);
        });
    });

    describe('> 运算符', () => {
        it('a > b 时返回 true', () => {
            expect(handleComparison(10, 5, '>')).toBe(true);
        });

        it('a <= b 时返回 false', () => {
            expect(handleComparison(3, 5, '>')).toBe(false);
            expect(handleComparison(5, 5, '>')).toBe(false);
        });
    });

    describe('< 运算符', () => {
        it('a < b 时返回 true', () => {
            expect(handleComparison(3, 10, '<')).toBe(true);
        });

        it('a >= b 时返回 false', () => {
            expect(handleComparison(10, 3, '<')).toBe(false);
        });
    });

    describe('>= 运算符', () => {
        it('a >= b 时返回 true', () => {
            expect(handleComparison(5, 3, '>=')).toBe(true);
            expect(handleComparison(5, 5, '>=')).toBe(true);
        });
    });

    describe('<= 运算符', () => {
        it('a <= b 时返回 true', () => {
            expect(handleComparison(3, 5, '<=')).toBe(true);
            expect(handleComparison(5, 5, '<=')).toBe(true);
        });
    });

    it('二维数组与标量比较', () => {
        const fp = [[1, 5], [3, 7]];
        const result = handleComparison(fp, 4, '>');
        expect(result).toEqual([[false, true], [false, true]]);
    });

    it('标量与二维数组比较', () => {
        const tp = [[1, 5], [3, 7]];
        const result = handleComparison(4, tp, '<');
        expect(result).toEqual([[false, true], [false, true]]);
    });
});
