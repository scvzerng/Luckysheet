import { describe, it, expect, vi } from 'vitest';

vi.mock('../../locale/locale', () => ({
    default: vi.fn(() => ({
        sheetconfig: {
            delete: '删除',
            copy: '复制',
            rename: '重命名',
            changeColor: '更改颜色',
            hide: '隐藏',
            unhide: '取消隐藏',
            moveLeft: '向左移动',
            moveRight: '向右移动',
            resetColor: '重置颜色',
        },
        filter: {
            sortByAsc: '升序排列',
            sortByDesc: '降序排列',
            filterByColor: '按颜色筛选',
            filterByCondition: '按条件筛选',
            filiterInputNone: '无',
            conditionNone: '无',
            conditionCellIsNull: '单元格为空',
            conditionCellNotNull: '单元格不为空',
            conditionCellTextContain: '文本包含',
            conditionCellTextNotContain: '文本不包含',
            conditionCellTextStart: '文本开头为',
            conditionCellTextEnd: '文本结尾为',
            conditionCellTextEqual: '文本等于',
            conditionDateEqual: '日期等于',
            conditionDateBefore: '日期早于',
            conditionDateAfter: '日期晚于',
            conditionNumberEqual: '数字等于',
            conditionNumberGreaterThan: '数字大于',
            conditionNumberLessThan: '数字小于',
            conditionNumberGreaterThanOrEqual: '数字大于等于',
            conditionNumberLessThanOrEqual: '数字小于等于',
            conditionNumberBetween: '数字介于',
            conditionNumberNotBetween: '数字不介于',
        },
        alternatingColors: {
            close: '关闭',
            applyRange: '应用范围',
            selectRange: '选择范围',
            header: '表头',
            footer: '表尾',
            textTitle: '文本标题',
            custom: '自定义',
            colorShow: '颜色',
            selectionTextColor: '选择文字颜色',
            selectionCellColor: '选择单元格颜色',
            removeColor: '移除颜色',
        },
        toolbar: {
            alternatingColors: '交替颜色',
        },
    })),
}));

vi.mock('./configFunctions', () => ({
    customSheetRightClickConfig: vi.fn(() => ({
        delete: true,
        copy: true,
        rename: true,
        color: true,
        hide: true,
        move: true,
    })),
}));

import { sheetconfigHTML, filtermenuHTML, filtersubmenuHTML, luckysheetAlternateformatHtml } from './sheetTemplate';

describe('sheetTemplate - 工作表相关模板', () => {
    describe('sheetconfigHTML', () => {
        it('应返回包含工作表标签右键菜单的HTML字符串', () => {
            const html = sheetconfigHTML();
            expect(html).toContain('luckysheet-rightclick-sheet-menu');
        });

        it('应包含删除选项', () => {
            const html = sheetconfigHTML();
            expect(html).toContain('luckysheetsheetconfigdelete');
        });

        it('应包含复制选项', () => {
            const html = sheetconfigHTML();
            expect(html).toContain('luckysheetsheetconfigcopy');
        });

        it('应包含重命名选项', () => {
            const html = sheetconfigHTML();
            expect(html).toContain('luckysheetsheetconfigrename');
        });

        it('应包含颜色选择子菜单', () => {
            const html = sheetconfigHTML();
            expect(html).toContain('luckysheetsheetconfigcolor_sub');
        });
    });

    describe('filtermenuHTML', () => {
        it('应返回包含筛选菜单的HTML字符串', () => {
            const html = filtermenuHTML();
            expect(html).toContain('luckysheet-filter-menu');
        });

        it('应包含升序和降序选项', () => {
            const html = filtermenuHTML();
            expect(html).toContain('orderby-asc');
            expect(html).toContain('orderby-desc');
        });

        it('应包含按条件筛选选项', () => {
            const html = filtermenuHTML();
            expect(html).toContain('bycondition');
        });

        it('应包含menuid占位符', () => {
            const html = filtermenuHTML();
            expect(html).toContain('${menuid}');
        });
    });

    describe('filtersubmenuHTML', () => {
        it('应返回包含条件筛选子菜单的HTML字符串', () => {
            const html = filtersubmenuHTML();
            expect(html).toContain('luckysheet-filter-submenu');
        });

        it('应包含空值和非空值条件', () => {
            const html = filtersubmenuHTML();
            expect(html).toContain('cellnull');
            expect(html).toContain('cellnonull');
        });

        it('应包含文本条件选项', () => {
            const html = filtersubmenuHTML();
            expect(html).toContain('textinclude');
            expect(html).toContain('textnotinclude');
        });

        it('应包含menuid占位符', () => {
            const html = filtersubmenuHTML();
            expect(html).toContain('${menuid}');
        });
    });

    describe('luckysheetAlternateformatHtml', () => {
        it('应返回包含交替颜色面板的HTML字符串', () => {
            const html = luckysheetAlternateformatHtml();
            expect(html).toContain('luckysheet-modal-dialog-slider-alternateformat');
        });

        it('应包含应用范围输入', () => {
            const html = luckysheetAlternateformatHtml();
            expect(html).toContain('luckysheet-alternateformat-range');
        });

        it('应包含表头和表尾复选框', () => {
            const html = luckysheetAlternateformatHtml();
            expect(html).toContain('luckysheet-alternateformat-rowHeader');
            expect(html).toContain('luckysheet-alternateformat-rowFooter');
        });

        it('应包含移除颜色按钮', () => {
            const html = luckysheetAlternateformatHtml();
            expect(html).toContain('luckysheet-alternateformat-remove');
        });
    });
});
