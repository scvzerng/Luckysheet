import $ from '../jquery-bridge.js';

class CellMain {
    constructor() { this._el = null; }

    get el() {
        if (!this._el) this._el = $("#luckysheet-cell-main");
        return this._el;
    }

    getWidth() { return this.el.width(); }
    getHeight() { return this.el.height(); }
    setHeight(value) { this.el.height(value); return this; }

    getScrollHeight() { return this.el[0].scrollHeight; }
    getScrollWidth() { return this.el[0].scrollWidth; }

    append(html) { this.el.append(html); return this; }
    appendTo(selector) { this.el.appendTo(selector); return this; }

    onClick(selector, callback) { this.el.on("click", selector, callback); return this; }
    onScroll(callback) { this.el.scroll(callback); return this; }
    onMousewheel(callback) { this.el.mousewheel(callback); return this; }
}

export default new CellMain();
