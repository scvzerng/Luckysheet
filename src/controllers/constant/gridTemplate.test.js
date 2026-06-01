import { describe, it, expect, vi } from 'vitest';

vi.mock('../../locale/locale', () => ({
    default: vi.fn(() => ({
        info: {
            return: '返回',
            tips: '提示',
            noName: '未命名',
            rename: '重命名',
            detailUpdate: '详情更新',
            wait: '等待',
            loading: '加载中...',
        },
        print: {},
    })),
}));

vi.mock('../../utils/util', () => ({
    getObjType: vi.fn((v) => {
        if (typeof v === 'string') return 'string';
        if (typeof v === 'object' && v !== null) return 'object';
        return 'undefined';
    }),
}));

vi.mock('../luckysheetConfigsetting', () => ({
    default: {
        userInfo: true,
    },
}));

import { gridHTML } from './gridTemplate';

describe('gridTemplate - 主网格DOM模板', () => {
    it('应返回包含luckysheet容器的HTML字符串', () => {
        const html = gridHTML();
        expect(html).toContain('luckysheet');
        expect(html).toContain('luckysheet-work-area');
    });

    it('应包含信息栏区域', () => {
        const html = gridHTML();
        expect(html).toContain('luckysheet_info_detail');
    });

    it('应包含公式栏区域', () => {
        const html = gridHTML();
        expect(html).toContain('luckysheet-formula-bar');
    });

    it('应包含网格主体区域', () => {
        const html = gridHTML();
        expect(html).toContain('luckysheet-grid-body');
    });

    it('应包含canvas元素', () => {
        const html = gridHTML();
        expect(html).toContain('luckysheetTableContent');
    });

    it('应包含工作表标签区域', () => {
        const html = gridHTML();
        expect(html).toContain('luckysheet-sheet-area');
    });

    it('应包含缩放控件', () => {
        const html = gridHTML();
        expect(html).toContain('luckysheet-zoom-content');
    });

    it('应包含复制内容区域', () => {
        const html = gridHTML();
        expect(html).toContain('luckysheet-copy-content');
    });

    it('应包含列头和行头占位符', () => {
        const html = gridHTML();
        expect(html).toContain('${columnHeader}');
        expect(html).toContain('${rowHeader}');
    });

    it('应包含菜单占位符', () => {
        const html = gridHTML();
        expect(html).toContain('${menu}');
    });
});
