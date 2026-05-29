import $ from '../jquery-bridge.js';

class RowHeader {
    constructor() { this._el = null; }
    get el() { if (!this._el || this._el.length === 0) this._el = $("#luckysheet-rows-h"); return this._el; }

    getScrollTop() { return this.el.scrollTop(); }
    setScrollTop(value) { this.el.scrollTop(value); return this; }
    setHeight(value) { this.el.height(value); return this; }
    setWidth(value) { this.el.width(value); return this; }
    onMousedown(callback) { this.el.mousedown(callback); return this; }
    onMousemove(callback) { this.el.mousemove(callback); return this; }
    onMouseup(callback) { this.el.mouseup(callback); return this; }
    onMouseleave(callback) { this.el.mouseleave(callback); return this; }
    onClick(callback) { this.el.click(callback); return this; }
    onContextmenu(callback) { this.el.on("contextmenu", callback); return this; }
    setCursor(cursor) {
        $("#luckysheet-sheettable").css("cursor", cursor);
        this.el.css("cursor", cursor);
        this.el.find("canvas").css("cursor", cursor);
        return this;
    }
}

class ColHeader {
    constructor() { this._el = null; }
    get el() { if (!this._el || this._el.length === 0) this._el = $("#luckysheet-cols-h-c"); return this._el; }

    getScrollLeft() { return this.el.scrollLeft(); }
    setScrollLeft(value) { this.el.scrollLeft(value); return this; }
    setHeight(value) { this.el.height(value); return this; }
    setWidth(value) { this.el.width(value); return this; }
    onMousedown(callback) { this.el.mousedown(callback); return this; }
    onMousemove(callback) { this.el.mousemove(callback); return this; }
    onMouseup(callback) { this.el.mouseup(callback); return this; }
    onMouseleave(callback) { this.el.mouseleave(callback); return this; }
    onClick(callback) { this.el.click(callback); return this; }
    onContextmenu(callback) { this.el.on("contextmenu", callback); return this; }
    setCursor(cursor) {
        $("#luckysheet-sheettable").css("cursor", cursor);
        this.el.css("cursor", cursor);
        $(".luckysheet-cols-h-cells").css("cursor", cursor);
        $(".luckysheet-cols-h-cells canvas").css("cursor", cursor);
        return this;
    }
}

export const rowHeader = new RowHeader();
export const colHeader = new ColHeader();
