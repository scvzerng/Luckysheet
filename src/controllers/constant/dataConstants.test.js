import { describe, it, expect, vi } from 'vitest';
import {
    columeHeader_word,
    columeHeader_word_index,
    flow,
    colsmenuHTML,
    sheetHTML,
    columnHeaderHTML,
    sheetselectlistHTML,
    sheetselectlistitemHTML,
    inputHTML,
    modelHTML,
    maskHTML,
    luckyColor,
    keycode,
    luckysheetdefaultstyle,
    iconfontObjects,
} from './dataConstants';

describe('dataConstants - 数据常量', () => {
    describe('columeHeader_word', () => {
        it('应包含26个大写英文字母', () => {
            expect(columeHeader_word).toHaveLength(26);
            expect(columeHeader_word[0]).toBe('A');
            expect(columeHeader_word[25]).toBe('Z');
        });

        it('字母应按顺序排列', () => {
            for (let i = 0; i < 26; i++) {
                expect(columeHeader_word[i]).toBe(String.fromCharCode(65 + i));
            }
        });
    });

    describe('columeHeader_word_index', () => {
        it('应将字母映射到正确的索引', () => {
            expect(columeHeader_word_index.A).toBe(0);
            expect(columeHeader_word_index.Z).toBe(25);
            expect(columeHeader_word_index.M).toBe(12);
        });

        it('应包含26个映射', () => {
            expect(Object.keys(columeHeader_word_index)).toHaveLength(26);
        });
    });

    describe('flow', () => {
        it('应包含单元格溢出流的HTML模板', () => {
            expect(flow).toContain('luckysheet-cell-flow');
            expect(flow).toContain('${index}');
            expect(flow).toContain('${width}');
            expect(flow).toContain('${flow}');
        });
    });

    describe('colsmenuHTML', () => {
        it('初始值应为空字符串', () => {
            expect(colsmenuHTML).toBe('');
        });
    });

    describe('sheetHTML', () => {
        it('应包含工作表标签的HTML模板占位符', () => {
            expect(sheetHTML).toContain('${style}');
            expect(sheetHTML).toContain('${index}');
            expect(sheetHTML).toContain('${name}');
        });
    });

    describe('columnHeaderHTML', () => {
        it('应包含列头单元格的HTML模板占位符', () => {
            expect(columnHeaderHTML).toContain('${index}');
            expect(columnHeaderHTML).toContain('${width}');
            expect(columnHeaderHTML).toContain('${column}');
        });
    });

    describe('sheetselectlistHTML', () => {
        it('应包含工作表选择列表的HTML模板占位符', () => {
            expect(sheetselectlistHTML).toContain('${item}');
        });
    });

    describe('sheetselectlistitemHTML', () => {
        it('应包含工作表列表项的HTML模板占位符', () => {
            expect(sheetselectlistitemHTML).toContain('${index}');
            expect(sheetselectlistitemHTML).toContain('${name}');
        });
    });

    describe('inputHTML', () => {
        it('应包含单元格输入框的HTML模板', () => {
            expect(inputHTML).toContain('luckysheet-rich-text-editor');
            expect(inputHTML).toContain('contenteditable');
        });
    });

    describe('modelHTML', () => {
        it('应包含模态对话框的HTML模板占位符', () => {
            expect(modelHTML).toContain('${id}');
            expect(modelHTML).toContain('${title}');
            expect(modelHTML).toContain('${content}');
        });
    });

    describe('maskHTML', () => {
        it('应包含遮罩层的HTML', () => {
            expect(maskHTML).toContain('luckysheet-modal-dialog-mask');
        });
    });

    describe('luckyColor', () => {
        it('应包含预设颜色数组', () => {
            expect(Array.isArray(luckyColor)).toBe(true);
            expect(luckyColor.length).toBeGreaterThan(0);
        });

        it('每个颜色值应为有效的十六进制格式', () => {
            luckyColor.forEach(color => {
                expect(color).toMatch(/^#[0-9a-f]{6}$/i);
            });
        });
    });

    describe('keycode', () => {
        it('应包含常用键盘按键码', () => {
            expect(keycode.BACKSPACE).toBe(8);
            expect(keycode.ENTER).toBe(13);
            expect(keycode.ESC).toBe(27);
            expect(keycode.LEFT).toBe(37);
            expect(keycode.UP).toBe(38);
            expect(keycode.RIGHT).toBe(39);
            expect(keycode.DOWN).toBe(40);
            expect(keycode.DELETE).toBe(46);
        });

        it('应包含F1-F12功能键', () => {
            expect(keycode.F1).toBe(112);
            expect(keycode.F12).toBe(123);
        });
    });

    describe('luckysheetdefaultstyle', () => {
        it('应包含Canvas默认绘制样式', () => {
            expect(luckysheetdefaultstyle.fillStyle).toBe('#000000');
            expect(luckysheetdefaultstyle.textBaseline).toBe('middle');
            expect(luckysheetdefaultstyle.strokeStyle).toBe('#dfdfdf');
            expect(luckysheetdefaultstyle.textAlign).toBe('center');
        });
    });

    describe('iconfontObjects', () => {
        it('应包含边框图标映射', () => {
            expect(iconfontObjects.border).toBeDefined();
            expect(iconfontObjects.border['border-top']).toContain('iconfont-luckysheet');
            expect(iconfontObjects.border['border-all']).toContain('iconfont-luckysheet');
        });

        it('应包含对齐图标映射', () => {
            expect(iconfontObjects.align).toBeDefined();
            expect(iconfontObjects.align.left).toContain('iconfont-luckysheet');
            expect(iconfontObjects.align.center).toContain('iconfont-luckysheet');
        });

        it('应包含文本换行图标映射', () => {
            expect(iconfontObjects.textWrap).toBeDefined();
            expect(iconfontObjects.textWrap.overflow).toContain('iconfont-luckysheet');
        });

        it('应包含旋转图标映射', () => {
            expect(iconfontObjects.rotation).toBeDefined();
            expect(iconfontObjects.rotation.none).toContain('iconfont-luckysheet');
        });
    });
});
