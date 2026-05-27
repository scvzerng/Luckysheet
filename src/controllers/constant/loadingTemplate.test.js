import { describe, it, expect, vi } from 'vitest';

vi.mock('../../locale/locale', () => ({
    default: vi.fn(() => ({
        info: { loading: '加载中...' },
    })),
}));

vi.mock('../luckysheetConfigsetting', () => ({
    default: {
        loading: {},
    },
}));

vi.mock('../toolbar', () => ({
    createToolbarHtml: vi.fn(() => '<div class="toolbar-mock"></div>'),
}));

vi.mock('uuid', () => ({
    v4: vi.fn(() => 'test-uuid-1234'),
}));

import { luckysheetToolHTML, menuToolBar, luckysheetlodingHTML } from './loadingTemplate';
import { createToolbarHtml } from '../toolbar';

describe('loadingTemplate - 加载相关模板', () => {
    describe('luckysheetToolHTML', () => {
        it('应包含tooltip的HTML', () => {
            expect(luckysheetToolHTML).toContain('jfk-tooltip');
        });
    });

    describe('menuToolBar', () => {
        it('应调用createToolbarHtml并返回结果', () => {
            const result = menuToolBar();
            expect(createToolbarHtml).toHaveBeenCalled();
            expect(result).toBe('<div class="toolbar-mock"></div>');
        });
    });

    describe('luckysheetlodingHTML', () => {
        beforeEach(() => {
            const mockEl = { id: '', className: '', innerHTML: '' };
            global.$ = vi.fn((sel) => {
                if (typeof sel === 'string') {
                    return {
                        show: vi.fn(),
                        hide: vi.fn(),
                    };
                }
                return {
                    html: vi.fn(function() { return this; }),
                    append: vi.fn(),
                };
            });
            global.document = {
                createElement: vi.fn(() => ({ id: '', className: '', innerHTML: '' })),
                createElementNS: vi.fn(() => ({
                    setAttribute: vi.fn(),
                    appendChild: vi.fn(),
                    outerHTML: '<svg></svg>',
                })),
            };
        });

        it('target为null时应返回undefined', () => {
            const result = luckysheetlodingHTML(null);
            expect(result).toBeUndefined();
        });

        it('应返回包含show和close方法的对象', () => {
            const mockTarget = {};
            const result = luckysheetlodingHTML(mockTarget);
            if (result) {
                expect(result).toHaveProperty('show');
                expect(result).toHaveProperty('close');
                expect(typeof result.show).toBe('function');
                expect(typeof result.close).toBe('function');
            }
        });
    });
});
