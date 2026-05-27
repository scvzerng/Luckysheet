import { describe, it, expect } from 'vitest';
import { booleanOperation, booleanToNum } from './compareHelpers';

describe('booleanOperation', () => {
    describe('== 运算符', () => {
        it('相等数字返回 true', () => {
            expect(booleanOperation(1, '==', 1)).toBe(true);
        });

        it('不等数字返回 false', () => {
            expect(booleanOperation(1, '==', 2)).toBe(false);
        });

        it('数字字符串会隐式转换为数字', () => {
            expect(booleanOperation('3', '==', 3)).toBe(true);
        });

        it('字符串宽松比较', () => {
            expect(booleanOperation('abc', '==', 'abc')).toBe(true);
            expect(booleanOperation('abc', '==', 'def')).toBe(false);
        });
    });

    describe('!= 运算符', () => {
        it('不同值返回 true', () => {
            expect(booleanOperation(1, '!=', 2)).toBe(true);
        });

        it('相同值返回 false', () => {
            expect(booleanOperation(5, '!=', 5)).toBe(false);
        });
    });

    describe('>= 运算符', () => {
        it('a >= b 时返回 true', () => {
            expect(booleanOperation(5, '>=', 3)).toBe(true);
            expect(booleanOperation(5, '>=', 5)).toBe(true);
        });

        it('a < b 时返回 false', () => {
            expect(booleanOperation(2, '>=', 3)).toBe(false);
        });
    });

    describe('<= 运算符', () => {
        it('a <= b 时返回 true', () => {
            expect(booleanOperation(3, '<=', 5)).toBe(true);
            expect(booleanOperation(5, '<=', 5)).toBe(true);
        });

        it('a > b 时返回 false', () => {
            expect(booleanOperation(7, '<=', 3)).toBe(false);
        });
    });

    describe('> 运算符', () => {
        it('a > b 时返回 true', () => {
            expect(booleanOperation(10, '>', 5)).toBe(true);
        });

        it('a <= b 时返回 false', () => {
            expect(booleanOperation(3, '>', 5)).toBe(false);
            expect(booleanOperation(5, '>', 5)).toBe(false);
        });
    });

    describe('< 运算符', () => {
        it('a < b 时返回 true', () => {
            expect(booleanOperation(3, '<', 10)).toBe(true);
        });

        it('a >= b 时返回 false', () => {
            expect(booleanOperation(10, '<', 5)).toBe(false);
            expect(booleanOperation(5, '<', 5)).toBe(false);
        });
    });

    it('未知运算符返回 undefined', () => {
        expect(booleanOperation(1, '???', 2)).toBeUndefined();
    });
});

describe('booleanToNum', () => {
    it('null 原样返回', () => {
        expect(booleanToNum(null)).toBeNull();
    });

    it('将 true/"true"/"True"/"TRUE" 转换为 1', () => {
        expect(booleanToNum(true)).toBe(1);
        expect(booleanToNum('true')).toBe(1);
        expect(booleanToNum('True')).toBe(1);
        expect(booleanToNum('TRUE')).toBe(1);
    });

    it('将 false/"false"/"False"/"FALSE" 转换为 0', () => {
        expect(booleanToNum(false)).toBe(0);
        expect(booleanToNum('false')).toBe(0);
        expect(booleanToNum('False')).toBe(0);
        expect(booleanToNum('FALSE')).toBe(0);
    });

    it('数字原样返回', () => {
        expect(booleanToNum(42)).toBe(42);
        expect(booleanToNum(0)).toBe(0);
        expect(booleanToNum(-1)).toBe(-1);
    });

    it('非布尔字符串原样返回', () => {
        expect(booleanToNum('hello')).toBe('hello');
        expect(booleanToNum('123')).toBe('123');
    });
});
