import { describe, it, expect, vi } from 'vitest';

vi.mock('../../store', () => ({
    default: {
        luckysheet_select_save: [{ row: [0, 2], column: [0, 2] }],
        config: { merge: {} },
    },
}));

vi.mock('../../global/validate', () => ({
    hasPartMC: vi.fn(() => false),
    isEditMode: vi.fn(() => false),
}));

vi.mock('../../global/tooltip', () => ({
    default: { info: vi.fn() },
}));

vi.mock('../../locale/locale', () => ({
    default: vi.fn(() => ({
        drag: { noMulti: '不可多选', noPartMerge: '不可部分合并' },
    })),
}));

vi.mock('../../utils/util', () => ({
    luckysheetContainerFocus: vi.fn(),
}));

import { checkMultiSelection, checkPartMerge } from './matrixValidation';
import Store from '../../store';
import tooltip from '../../global/tooltip';

describe('matrixValidation - 矩阵操作验证', () => {
    describe('checkMultiSelection', () => {
        it('单选区时应返回false', () => {
            Store.luckysheet_select_save = [{ row: [0, 2], column: [0, 2] }];
            expect(checkMultiSelection()).toBe(false);
        });

        it('多选区时应返回true并提示', () => {
            Store.luckysheet_select_save = [
                { row: [0, 2], column: [0, 2] },
                { row: [4, 6], column: [0, 2] },
            ];
            expect(checkMultiSelection()).toBe(true);
            expect(tooltip.info).toHaveBeenCalled();
        });
    });

    describe('checkPartMerge', () => {
        it('无合并单元格时应返回false', () => {
            Store.config = { merge: {} };
            expect(checkPartMerge(0, 5, 0, 5)).toBe(false);
        });

        it('完全包含的合并单元格应返回false', () => {
            Store.config = {
                merge: { '1_1': { r: 1, rs: 2, c: 1, cs: 2 } },
            };
            expect(checkPartMerge(0, 5, 0, 5)).toBe(false);
        });
    });
});
