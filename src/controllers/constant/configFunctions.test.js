import {  describe,  it,  expect,  vi } from 'vitest';

vi.mock('../../locale/locale', () => ({
    default: vi.fn(() => ({
        info: { loading: '加载中...' },
        fontarray: ['SimSun', 'SimHei'],
    })),
}));

vi.mock('../../store', () => ({
    default: {
        defaultFontSize: 11,
    },
}));

vi.mock('../luckysheetConfigsetting', () => ({
    default: {
        cellRightClickConfig: {},
        sheetRightClickConfig: {},
    },
}));

import { luckysheetdefaultFont, customCellRightClickConfig, customSheetRightClickConfig } from './configFunctions';
import luckysheetConfigsetting from '../luckysheetConfigsetting';

describe('configFunctions - 配置函数', () => {
    describe('luckysheetdefaultFont', () => {
        it('应返回包含默认字号和字体的CSS字符串', () => {
            const result = luckysheetdefaultFont();
            expect(result).toContain('11pt');
            expect(result).toContain('normal');
        });

        it('应使用locale中的字体数组', () => {
            const result = luckysheetdefaultFont();
            expect(result).toContain('SimSun');
        });
    });

    describe('customCellRightClickConfig', () => {
        it('默认配置应所有选项都为true', () => {
            luckysheetConfigsetting.cellRightClickConfig = {};
            const config = customCellRightClickConfig();
            expect(config.copy).toBe(true);
            expect(config.paste).toBe(true);
            expect(config.insertRow).toBe(true);
            expect(config.deleteRow).toBe(true);
            expect(config.filter).toBe(true);
            expect(config.sort).toBe(true);
        });

        it('用户配置应覆盖默认配置', () => {
            luckysheetConfigsetting.cellRightClickConfig = { copy: false, filter: false };
            const config = customCellRightClickConfig();
            expect(config.copy).toBe(false);
            expect(config.filter).toBe(false);
            expect(config.paste).toBe(true);
        });

        it('应将合并后的配置写回luckysheetConfigsetting', () => {
            luckysheetConfigsetting.cellRightClickConfig = { copy: false };
            const config = customCellRightClickConfig();
            expect(luckysheetConfigsetting.cellRightClickConfig).toBe(config);
        });
    });

    describe('customSheetRightClickConfig', () => {
        it('默认配置应所有选项都为true', () => {
            luckysheetConfigsetting.sheetRightClickConfig = {};
            const config = customSheetRightClickConfig();
            expect(config.delete).toBe(true);
            expect(config.copy).toBe(true);
            expect(config.rename).toBe(true);
            expect(config.color).toBe(true);
            expect(config.hide).toBe(true);
            expect(config.move).toBe(true);
        });

        it('用户配置应覆盖默认配置', () => {
            luckysheetConfigsetting.sheetRightClickConfig = { delete: false, move: false };
            const config = customSheetRightClickConfig();
            expect(config.delete).toBe(false);
            expect(config.move).toBe(false);
            expect(config.copy).toBe(true);
        });

        it('应将合并后的配置写回luckysheetConfigsetting', () => {
            luckysheetConfigsetting.sheetRightClickConfig = { delete: false };
            const config = customSheetRightClickConfig();
            expect(luckysheetConfigsetting.sheetRightClickConfig).toBe(config);
        });
    });
});
