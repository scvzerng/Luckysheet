import { describe, it, expect } from 'vitest';
import { handleConcat } from './opConcat';

describe('handleConcat', () => {
    it('连接两个字符串', () => {
        expect(handleConcat('hello', 'world', '&')).toBe('helloworld');
    });

    it('连接数字和字符串', () => {
        expect(handleConcat(123, 'abc', '&')).toBe('123abc');
    });

    it('一维数组逐元素连接', () => {
        const result = handleConcat(['a', 'b'], ['1', '2'], '&');
        expect(result).toEqual(['a1', 'b2']);
    });

    it('二维数组逐元素连接', () => {
        const fp = [['a', 'b'], ['c', 'd']];
        const tp = [['1', '2'], ['3', '4']];
        const result = handleConcat(fp, tp, '&');
        expect(result).toEqual([['a1', 'b2'], ['c3', 'd4']]);
    });

    it('二维数组连接标量', () => {
        const fp = [['a', 'b'], ['c', 'd']];
        const result = handleConcat(fp, 'X', '&');
        expect(result).toEqual([['aX', 'bX'], ['cX', 'dX']]);
    });

    it('标量连接二维数组', () => {
        const tp = [['1', '2'], ['3', '4']];
        const result = handleConcat('X', tp, '&');
        expect(result).toEqual([['X1', 'X2'], ['X3', 'X4']]);
    });

    it('一维数组连接标量', () => {
        const result = handleConcat(['a', 'b'], 'X', '&');
        expect(result).toEqual(['aX', 'bX']);
    });

    it('标量连接一维数组', () => {
        const result = handleConcat('X', ['a', 'b'], '&');
        expect(result).toEqual(['Xa', 'Xb']);
    });

    it('null 值参与连接', () => {
        expect(handleConcat(null, 'abc', '&')).toBe('nullabc');
    });

    it('空字符串连接', () => {
        expect(handleConcat('', 'abc', '&')).toBe('abc');
    });
});
