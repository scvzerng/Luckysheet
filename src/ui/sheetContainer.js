import $ from '../jquery-bridge.js';

class SheetContainer {
    constructor() { this._el = null; }
    get el() { if (!this._el || this._el.length === 0) this._el = $("#luckysheet-sheet-container-c"); return this._el; }

    append(html) { this.el.append(html); return this; }
    getScrollLeft() { return this.el.scrollLeft(); }
    setScrollLeft(value) { this.el.scrollLeft(value); return this; }
    addClass(cls) { this.el.addClass(cls); return this; }
    getWidth() { return this.el.width(); }
    getScrollWidth() { return this.el[0].scrollWidth; }
    exists() { return this.el.length > 0; }
    onMousewheel(callback) { this.el.mousewheel(callback); return this; }
    find(selector) { return this.el.find(selector); }
    findVisible(selector) { return this.el.find(selector + ":visible"); }
    getActiveSheetItem() { return this.el.find("> div.luckysheet-sheets-item-active").eq(0); }
}

export default new SheetContainer();
