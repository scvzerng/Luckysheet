class RowHeader {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-rows-h"); return this._el; }

    getScrollTop() { return this.el.scrollTop; }
    setScrollTop(value) { this.el.scrollTop = value; return this; }
    setHeight(value) { this.el.style.height = typeof value === 'number' ? value + 'px' : value; return this; }
    setWidth(value) { this.el.style.width = typeof value === 'number' ? value + 'px' : value; return this; }
    onMousedown(callback) { this.el.addEventListener("mousedown", callback); return this; }
    onMousemove(callback) { this.el.addEventListener("mousemove", callback); return this; }
    onMouseup(callback) { this.el.addEventListener("mouseup", callback); return this; }
    onMouseleave(callback) { this.el.addEventListener("mouseleave", callback); return this; }
    onClick(callback) { this.el.addEventListener("click", callback); return this; }
    onContextmenu(callback) { this.el.addEventListener("contextmenu", callback); return this; }
    setCursor(cursor) {
        document.getElementById("luckysheet-sheettable").style.cursor = cursor;
        this.el.style.cursor = cursor;
        this.el.querySelectorAll("canvas").forEach(c => c.style.cursor = cursor);
        return this;
    }
}

class ColHeader {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-cols-h-c"); return this._el; }

    getScrollLeft() { return this.el.scrollLeft; }
    setScrollLeft(value) { this.el.scrollLeft = value; return this; }
    setHeight(value) { this.el.style.height = typeof value === 'number' ? value + 'px' : value; return this; }
    setWidth(value) { this.el.style.width = typeof value === 'number' ? value + 'px' : value; return this; }
    onMousedown(callback) { this.el.addEventListener("mousedown", callback); return this; }
    onMousemove(callback) { this.el.addEventListener("mousemove", callback); return this; }
    onMouseup(callback) { this.el.addEventListener("mouseup", callback); return this; }
    onMouseleave(callback) { this.el.addEventListener("mouseleave", callback); return this; }
    onClick(callback) { this.el.addEventListener("click", callback); return this; }
    onContextmenu(callback) { this.el.addEventListener("contextmenu", callback); return this; }
    setCursor(cursor) {
        document.getElementById("luckysheet-sheettable").style.cursor = cursor;
        this.el.style.cursor = cursor;
        document.querySelectorAll(".luckysheet-cols-h-cells").forEach(el => el.style.cursor = cursor);
        document.querySelectorAll(".luckysheet-cols-h-cells canvas").forEach(c => c.style.cursor = cursor);
        return this;
    }
}

export const rowHeader = new RowHeader();
export const colHeader = new ColHeader();
