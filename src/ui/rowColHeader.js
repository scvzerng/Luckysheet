class RowHeader {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-rows-h"); return this._el; }

    getScrollTop() { if (!this.el) return 0; return this.el.scrollTop; }
    setScrollTop(value) { if (!this.el) return this; this.el.scrollTop = value; return this; }
    setHeight(value) { if (!this.el) return this; this.el.style.height = typeof value === 'number' ? value + 'px' : value; return this; }
    setWidth(value) { if (!this.el) return this; this.el.style.width = typeof value === 'number' ? value + 'px' : value; return this; }
    onMousedown(callback) { if (!this.el) return this; this.el.addEventListener("mousedown", callback); return this; }
    onMousemove(callback) { if (!this.el) return this; this.el.addEventListener("mousemove", callback); return this; }
    onMouseup(callback) { if (!this.el) return this; this.el.addEventListener("mouseup", callback); return this; }
    onMouseleave(callback) { if (!this.el) return this; this.el.addEventListener("mouseleave", callback); return this; }
    onClick(callback) { if (!this.el) return this; this.el.addEventListener("click", callback); return this; }
    onContextmenu(callback) { if (!this.el) return this; this.el.addEventListener("contextmenu", callback); return this; }
    setCursor(cursor) {
        if (!this.el) return this;
        document.getElementById("luckysheet-sheettable").style.cursor = cursor;
        this.el.style.cursor = cursor;
        this.el.querySelectorAll("canvas").forEach(c => c.style.cursor = cursor);
        return this;
    }
}

class ColHeader {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-col-header"); return this._el; }

    getScrollLeft() { if (!this.el) return 0; return this.el.scrollLeft; }
    setScrollLeft(value) { if (!this.el) return this; this.el.scrollLeft = value; return this; }
    setHeight(value) { if (!this.el) return this; this.el.style.height = typeof value === 'number' ? value + 'px' : value; return this; }
    setWidth(value) { if (!this.el) return this; this.el.style.width = typeof value === 'number' ? value + 'px' : value; return this; }
    onMousedown(callback) { if (!this.el) return this; this.el.addEventListener("mousedown", callback); return this; }
    onMousemove(callback) { if (!this.el) return this; this.el.addEventListener("mousemove", callback); return this; }
    onMouseup(callback) { if (!this.el) return this; this.el.addEventListener("mouseup", callback); return this; }
    onMouseleave(callback) { if (!this.el) return this; this.el.addEventListener("mouseleave", callback); return this; }
    onClick(callback) { if (!this.el) return this; this.el.addEventListener("click", callback); return this; }
    onContextmenu(callback) { if (!this.el) return this; this.el.addEventListener("contextmenu", callback); return this; }
    setCursor(cursor) {
        if (!this.el) return this;
        document.getElementById("luckysheet-sheettable").style.cursor = cursor;
        this.el.style.cursor = cursor;
        document.querySelectorAll(".luckysheet-cols-h-cells").forEach(el => el.style.cursor = cursor);
        document.querySelectorAll(".luckysheet-cols-h-cells canvas").forEach(c => c.style.cursor = cursor);
        return this;
    }
}

export const rowHeader = new RowHeader();
export const colHeader = new ColHeader();
