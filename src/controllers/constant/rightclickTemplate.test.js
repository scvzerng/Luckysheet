import { describe, it, expect, vi } from 'vitest';

vi.mock('../../locale/locale', () => ({
    default: vi.fn(() => ({
        rightclick: {
            copy: '复制',
            copyAs: '复制为',
            paste: '粘贴',
            insert: '插入',
            row: '行',
            column: '列',
            deleteSelected: '删除选中',
            deleteCell: '删除单元格',
            moveLeft: '左侧左移',
            moveUp: '上方上移',
            hide: '隐藏',
            hideSelected: '隐藏选中',
            showHide: '显示/隐藏',
            width: '宽度',
            number: '数量',
            to: '到',
            left: '左',
            right: '右',
            add: '添加',
            orderAZ: '升序排列',
            orderZA: '降序排列',
            clearContent: '清除内容',
            matrix: '矩阵',
            sortSelection: '排序选择',
            filterSelection: '筛选选择',
            flip: '翻转',
            upAndDown: '上下',
            leftAndRight: '左右',
            clockwise: '顺时针',
            counterclockwise: '逆时针',
            transpose: '转置',
            matrixCalculation: '矩阵计算',
            plus: '加',
            minus: '减',
            multiply: '乘',
            divided: '除',
            power: '幂',
            root: '根',
            log: '对数',
            delete0: '删除零值',
            byRow: '按行',
            byCol: '按列',
            removeDuplicate: '删除重复值',
            diagonal: '对角线',
            antiDiagonal: '反对角线',
            diagonalOffset: '对角线偏移',
            offset: '偏移',
            boolean: '布尔值',
            array1: '一维数组',
            array2: '二维数组',
            array3: '多维数组',
            firstLineTitle: '(含表头)',
            untitled: '(无表头)',
        },
        toolbar: {
            insertImage: '插入图片',
            insertLink: '插入链接',
        },
    })),
}));

vi.mock('./configFunctions', () => ({
    customCellRightClickConfig: vi.fn(() => ({
        copy: true,
        copyAs: true,
        paste: true,
        insertRow: true,
        insertColumn: true,
        deleteRow: true,
        deleteColumn: true,
        deleteCell: true,
        hideRow: true,
        hideColumn: true,
        rowHeight: true,
        columnWidth: true,
        clear: true,
        matrix: true,
        sort: true,
        filter: true,
        image: true,
        link: true,
        data: true,
        customs: [],
    })),
}));

import { rightclickHTML } from './rightclickTemplate';
import { customCellRightClickConfig } from './configFunctions';

describe('rightclickTemplate - 右键菜单DOM模板', () => {
    it('应返回包含右键菜单的HTML字符串', () => {
        const html = rightclickHTML();
        expect(html).toContain('luckysheet-rightclick-menu');
    });

    it('应包含复制按钮', () => {
        const html = rightclickHTML();
        expect(html).toContain('luckysheet-copy-btn');
    });

    it('应包含粘贴按钮', () => {
        const html = rightclickHTML();
        expect(html).toContain('luckysheet-copy-paste');
    });

    it('应包含复制为子菜单', () => {
        const html = rightclickHTML();
        expect(html).toContain('luckysheetcopyfor_sub');
    });

    it('应包含矩阵操作子菜单', () => {
        const html = rightclickHTML();
        expect(html).toContain('luckysheetmatrix_sub');
    });

    it('应调用customCellRightClickConfig获取配置', () => {
        rightclickHTML();
        expect(customCellRightClickConfig).toHaveBeenCalled();
    });

    it('配置项为false时对应菜单应隐藏', () => {
        customCellRightClickConfig.mockReturnValueOnce({
            copy: false,
            copyAs: true,
            paste: true,
            insertRow: true,
            insertColumn: true,
            deleteRow: true,
            deleteColumn: true,
            deleteCell: true,
            hideRow: true,
            hideColumn: true,
            rowHeight: true,
            columnWidth: true,
            clear: true,
            matrix: true,
            sort: true,
            filter: true,
            image: true,
            link: true,
            data: true,
            customs: [],
        });
        const html = rightclickHTML();
        expect(html).toContain('display:none');
    });
});
