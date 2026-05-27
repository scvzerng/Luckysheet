import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../formula', () => ({
    default: {
        execFunctionExist: [],
        execFunctionGroup: vi.fn(),
    },
}));

import { runExecFunction, getRefreshCanvasTimeOut, setRefreshCanvasTimeOut, clearRefreshCanvasTimeOut } from './refreshCore';
import formula from '../formula';

describe('refreshCore - 核心刷新函数', () => {
    describe('runExecFunction', () => {
        it('应将范围内的单元格坐标推入execFunctionExist', () => {
            const range = [{ row: [0, 2], column: [0, 1] }];
            formula.execFunctionExist = [];
            runExecFunction(range, 0, null);
            expect(formula.execFunctionExist.length).toBe(6);
        });

        it('应调用execFunctionGroup', () => {
            const range = [{ row: [0, 0], column: [0, 0] }];
            formula.execFunctionExist = [];
            runExecFunction(range, 0, null);
            expect(formula.execFunctionGroup).toHaveBeenCalled();
        });

        it('空范围应不添加任何坐标', () => {
            const range = [];
            formula.execFunctionExist = [];
            runExecFunction(range, 0, null);
            expect(formula.execFunctionExist.length).toBe(0);
        });
    });

    describe('refreshCanvasTimeOut 管理', () => {
        beforeEach(() => {
            setRefreshCanvasTimeOut(undefined);
        });

        it('getRefreshCanvasTimeOut 初始应返回undefined', () => {
            expect(getRefreshCanvasTimeOut()).toBeUndefined();
        });

        it('setRefreshCanvasTimeOut 应设置定时器值', () => {
            const timer = setTimeout(() => {}, 1000);
            setRefreshCanvasTimeOut(timer);
            expect(getRefreshCanvasTimeOut()).toBe(timer);
            clearTimeout(timer);
        });

        it('clearRefreshCanvasTimeOut 应清除定时器', () => {
            vi.useFakeTimers();
            setRefreshCanvasTimeOut(setTimeout(() => {}, 10000));
            clearRefreshCanvasTimeOut();
            expect(getRefreshCanvasTimeOut()).toBeUndefined();
            vi.useRealTimers();
        });
    });
});
