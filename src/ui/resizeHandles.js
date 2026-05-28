import $ from '../jquery-bridge.js';

class ResizeHandle {
    constructor(selector) {
        this._selector = selector;
        this._el = null;
    }
    get el() { if (!this._el) this._el = $(this._selector); return this._el; }

    setCss(props) { this.el.css(props); return this; }
    hide() { this.el.hide(); return this; }
    show() { this.el.show(); return this; }
    addClass(cls) { this.el.addClass(cls); return this; }
    removeClass(cls) { this.el.removeClass(cls); return this; }
    onMousedown(callback) { this.el.mousedown(callback); return this; }
}

const resizeHandles = {
    colChangeSize: new ResizeHandle("#luckysheet-cols-change-size"),
    rowChangeSize: new ResizeHandle("#luckysheet-rows-change-size"),
    changeSizeLine: new ResizeHandle("#luckysheet-change-size-line"),
    colHover: new ResizeHandle("#luckysheet-cols-h-hover"),
    rowHover: new ResizeHandle("#luckysheet-rows-h-hover"),
    sheetTable: new ResizeHandle("#luckysheet-sheettable_0"),
};

export default resizeHandles;
