import $ from '../jquery-bridge.js';

class CellMain {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || this._el.length === 0) this._el = $("#luckysheet-cell-main");
        return this._el;
    }

    getWidth() { return this.el.width(); }
    getHeight() { return this.el.height(); }
    setHeight(value) { this.el.height(value); return this; }
    setWidth(value) { this.el.width(value); return this; }

    getScrollHeight() { return this.el[0].scrollHeight; }
    getScrollWidth() { return this.el[0].scrollWidth; }
    getScrollLeft() { return this.el.scrollLeft(); }
    getScrollTop() { return this.el.scrollTop(); }

    append(html) { this.el.append(html); return this; }
    appendTo(selector) { this.el.appendTo(selector); return this; }

    onClick(selector, callback) { this.el.on("click", selector, callback); return this; }
    onScroll(callback) { this.el.scroll(callback); return this; }
    onMousewheel(callback) { this.el.mousewheel(callback); return this; }

    setCursor(cursor) {
        this.el.css("cursor", cursor);
        $("#luckysheetTableContent, #luckysheet-sheettable_0").css("cursor", cursor);
        return this;
    }

    setCursorDefault() {
        this.el.css("cursor", "default");
        $("#luckysheetTableContent, #luckysheet-sheettable_0").css("cursor", "default");
        return this;
    }

    onCellMousedown(callback) { this.el.mousedown(callback); return this; }
    onCellMouseup(callback) { this.el.mouseup(callback); return this; }
    onCellDblclick(callback) { this.el.dblclick(callback); return this; }

    find(selector) { return this.el.find(selector); }
    closest(selector) { return this.el.closest(selector); }
}

export default new CellMain();
