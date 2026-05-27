import { describe, it, expect, vi } from 'vitest';
import { labelFilterOptionState } from './labelFilterOptionState';

vi.mock('../../methods/get', () => ({
    getSheetIndex: vi.fn(() => 0),
}));

vi.mock('../../global/editor', () => ({
    default: {},
}));

vi.mock('../../global/validate', () => ({
    isRealNull: vi.fn((v) => v === null || v === undefined),
    isEditMode: vi.fn(() => false),
}));

vi.mock('../../global/tooltip', () => ({
    default: { info: vi.fn() },
}));

vi.mock('../../global/getRowlen', () => ({
    rowlenByRange: vi.fn(),
}));

vi.mock('../select', () => ({
    selectHightlightShow: vi.fn(),
}));

vi.mock('../sheetMove', () => ({
    luckysheetMoveEndCell: vi.fn(),
}));

vi.mock('../constant', () => ({
    luckysheetlodingHTML: vi.fn(),
}));

vi.mock('../../locale/locale', () => ({
    default: vi.fn(() => ({ filter: {}, button: {} })),
}));

vi.mock('../../store', () => ({
    default: {
        currentSheetIndex: 0,
        luckysheetfile: [{ filter: null }],
    },
}));

vi.mock('../menuButton', () => ({ default: {} }));
vi.mock('../conditionformat', () => ({ default: {} }));
vi.mock('../alternateformat', () => ({ default: {} }));
vi.mock('../../utils/util', () => ({
    rgbTohex: vi.fn(),
    showrightclickmenu: vi.fn(),
}));
vi.mock('../../global/cleargridelement', () => ({ default: vi.fn() }));
vi.mock('../../global/refresh', () => ({
    jfrefreshgrid: vi.fn(),
    jfrefreshgrid_rhcw: vi.fn(),
}));
vi.mock('../../global/sort', () => ({
    orderbydata: vi.fn(),
    orderbydata1D: vi.fn(),
}));
vi.mock('../../global/json', () => ({ default: {} }));
vi.mock('../../global/format', () => ({
    update: vi.fn(),
    genarate: vi.fn(),
}));

function createMock$top() {
    const data = {};
    const classes = { add: [], remove: [] };
    return {
        addClass: vi.fn(function(cls) { classes.add.push(cls); return this; }),
        removeClass: vi.fn(function(cls) { classes.remove.push(cls); return this; }),
        data: vi.fn(function(key, val) {
            if (val !== undefined) { data[key] = val; return this; }
            return data[key];
        }),
        html: vi.fn(function() { return this; }),
        _data: data,
        _classes: classes,
    };
}

describe('labelFilterOptionState', () => {
    it('激活筛选状态时添加 active 类并设置数据', () => {
        const $top = createMock$top();
        const rowhidden = { 1: 0, 3: 0 };
        const caljs = { value: 'cellnull', type: '0', text: '为空', value1: null, value2: null };

        labelFilterOptionState($top, true, rowhidden, caljs, false, 0, 10, 2, 0, 5);

        expect($top.addClass).toHaveBeenCalledWith('luckysheet-filter-options-active');
        expect($top.data).toHaveBeenCalledWith('rowhidden', JSON.stringify(rowhidden));
        expect($top.data).toHaveBeenCalledWith('caljs', JSON.stringify(caljs));
    });

    it('取消筛选状态时移除 active 类并重置数据', () => {
        const $top = createMock$top();

        labelFilterOptionState($top, false, null, null, false, 0, 10, 2, 0, 5);

        expect($top.removeClass).toHaveBeenCalledWith('luckysheet-filter-options-active');
        expect($top.data).toHaveBeenCalledWith('byconditionvalue', 'null');
        expect($top.data).toHaveBeenCalledWith('byconditiontype', '0');
    });

    it('激活状态时设置 caljs 的条件值', () => {
        const $top = createMock$top();
        const caljs = { value: 'cellbetween', type: '2', text: '介于', value1: '10', value2: '20' };

        labelFilterOptionState($top, true, {}, caljs, false, 0, 10, 2, 0, 5);

        expect($top.data).toHaveBeenCalledWith('byconditionvalue', 'cellbetween');
        expect($top.data).toHaveBeenCalledWith('byconditionvalue1', '10');
        expect($top.data).toHaveBeenCalledWith('byconditionvalue2', '20');
    });

    it('caljs 为 null 时不设置条件值数据', () => {
        const $top = createMock$top();

        labelFilterOptionState($top, true, {}, null, false, 0, 10, 2, 0, 5);

        expect($top.data).not.toHaveBeenCalledWith('byconditionvalue', expect.anything());
    });
});
