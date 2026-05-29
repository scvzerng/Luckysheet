class CellMain {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-cell-main");
        return this._el;
    }

    getWidth() { return this.el.getBoundingClientRect().width; }
    getHeight() { return this.el.getBoundingClientRect().height; }
    setHeight(value) { this.el.style.height = typeof value === 'number' ? value + 'px' : value; return this; }
    setWidth(value) { this.el.style.width = typeof value === 'number' ? value + 'px' : value; return this; }

    getScrollHeight() { return this.el.scrollHeight; }
    getScrollWidth() { return this.el.scrollWidth; }
    getScrollLeft() { return this.el.scrollLeft; }
    getScrollTop() { return this.el.scrollTop; }

    append(html) { this.el.insertAdjacentHTML('beforeend', html); return this; }
    appendTo(selector) { document.querySelector(selector).appendChild(this.el); return this; }

    onClick(selector, callback) {
        this.el.addEventListener("click", function(e) {
            const target = e.target.closest(selector);
            if (target && this.el.contains(target)) callback.call(target, e);
        }.bind(this));
        return this;
    }
    onScroll(callback) { this.el.addEventListener("scroll", callback); return this; }
    onMousewheel(callback) { this.el.addEventListener("wheel", callback); return this; }

    setCursor(cursor) {
        this.el.style.cursor = cursor;
        document.querySelectorAll("#luckysheetTableContent, #luckysheet-sheettable_0").forEach(el => el.style.cursor = cursor);
        return this;
    }

    setCursorDefault() {
        this.el.style.cursor = "default";
        document.querySelectorAll("#luckysheetTableContent, #luckysheet-sheettable_0").forEach(el => el.style.cursor = "default");
        return this;
    }

    onCellMousedown(callback) { this.el.addEventListener("mousedown", callback); return this; }
    onCellMouseup(callback) { this.el.addEventListener("mouseup", callback); return this; }
    onCellDblclick(callback) { this.el.addEventListener("dblclick", callback); return this; }

    find(selector) { return this.el.querySelector(selector); }
    closest(selector) { return this.el.closest(selector); }
}

export default new CellMain();
