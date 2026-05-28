import $ from '../jquery-bridge.js';

class SheetContainer {
    constructor() { this._el = null; }
    get el() { if (!this._el) this._el = $("#luckysheet-sheet-container-c"); return this._el; }

    append(html) { this.el.append(html); return this; }
    getScrollLeft() { return this.el.scrollLeft(); }
    setScrollLeft(value) { this.el.scrollLeft(value); return this; }
    addClass(cls) { this.el.addClass(cls); return this; }
    getWidth() { return this.el.width(); }
    getScrollWidth() { return this.el[0].scrollWidth; }
    exists() { return this.el.length > 0; }
    onMousewheel(callback) { this.el.mousewheel(callback); return this; }
}

export default new SheetContainer();
