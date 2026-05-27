import { describe, it, expect } from 'vitest';
import filterState from './filterState';

describe('filterState', () => {
    it('初始状态 hidefilersubmenu 为 null', () => {
        expect(filterState.hidefilersubmenu).toBeNull();
    });

    it('初始状态 locale_filter 为 null', () => {
        expect(filterState.locale_filter).toBeNull();
    });

    it('初始状态 locale_button 为 null', () => {
        expect(filterState.locale_button).toBeNull();
    });

    it('可以设置和读取 hidefilersubmenu', () => {
        const timer = setTimeout(() => {}, 10000);
        filterState.hidefilersubmenu = timer;
        expect(filterState.hidefilersubmenu).toBe(timer);
        clearTimeout(filterState.hidefilersubmenu);
        filterState.hidefilersubmenu = null;
    });

    it('可以设置和读取 locale_filter', () => {
        filterState.locale_filter = { filiterInputNone: '无' };
        expect(filterState.locale_filter.filiterInputNone).toBe('无');
        filterState.locale_filter = null;
    });

    it('可以设置和读取 locale_button', () => {
        filterState.locale_button = { confirm: '确定' };
        expect(filterState.locale_button.confirm).toBe('确定');
        filterState.locale_button = null;
    });
});
