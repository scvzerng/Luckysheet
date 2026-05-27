import { describe, it, expect } from 'vitest';
import { luckysheet_getarraydata, luckysheet_calcADPMM } from './arrayCalcUtils';

describe('luckysheet_getarraydata', () => {
    it('解析一维数组', () => {
        const result = luckysheet_getarraydata('{1,2,3}');
        expect(result).toEqual(['1', '2', '3']);
    });

    it('解析用分号分隔的二维数组', () => {
        const result = luckysheet_getarraydata('{1,2,3;4,5,6}');
        expect(result).toEqual([['1', '2', '3'], ['4', '5', '6']]);
    });

    it('去除双引号', () => {
        const result = luckysheet_getarraydata('{"a","b","c"}');
        expect(result).toEqual(['a', 'b', 'c']);
    });

    it('处理单个元素', () => {
        const result = luckysheet_getarraydata('{5}');
        expect(result).toEqual(['5']);
    });

    it('处理花括号内的空字符串', () => {
        const result = luckysheet_getarraydata('{,}');
        expect(result).toEqual(['', '']);
    });
});

describe('luckysheet_calcADPMM', () => {
    it('加法运算 (+)', () => {
        expect(luckysheet_calcADPMM(2, '+', 3)).toBeCloseTo(5);
    });

    it('减法运算 (-)', () => {
        expect(luckysheet_calcADPMM(10, '-', 3)).toBeCloseTo(7);
    });

    it('乘法运算 (*)', () => {
        expect(luckysheet_calcADPMM(4, '*', 5)).toBeCloseTo(20);
    });

    it('除法运算 (/)', () => {
        expect(luckysheet_calcADPMM(10, '/', 4)).toBeCloseTo(2.5);
    });

    it('取余运算 (%)', () => {
        expect(luckysheet_calcADPMM(10, '%', 3)).toBeCloseTo(1);
    });

    it('字符串数字输入', () => {
        expect(luckysheet_calcADPMM('2', '+', '3')).toBeCloseTo(5);
    });

    it('小数运算', () => {
        expect(luckysheet_calcADPMM(0.1, '+', 0.2)).toBeCloseTo(0.3, 5);
    });
});
