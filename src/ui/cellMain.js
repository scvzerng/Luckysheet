class CellMain {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-grid-body");
        return this._el;
    }

    getWidth() { if (!this.el) return 0; return this.el.getBoundingClientRect().width; }
    getHeight() { if (!this.el) return 0; return this.el.getBoundingClientRect().height; }
    setHeight(value) { if (!this.el) return this; this.el.style.height = typeof value === 'number' ? value + 'px' : value; return this; }
    setWidth(value) { if (!this.el) return this; this.el.style.width = typeof value === 'number' ? value + 'px' : value; return this; }

    getScrollHeight() { if (!this.el) return 0; return this.el.scrollHeight; }
    getScrollWidth() { if (!this.el) return 0; return this.el.scrollWidth; }
    getScrollLeft() { if (!this.el) return 0; return this.el.scrollLeft; }
    getScrollTop() { if (!this.el) return 0; return this.el.scrollTop; }

    append(html) { if (!this.el) return this; this.el.insertAdjacentHTML('beforeend', html); return this; }
    appendTo(selector) { if (!this.el) return this; document.querySelector(selector).appendChild(this.el); return this; }

    onClick(selector, callback) {
        if (!this.el) return this;
        this.el.addEventListener("click", function(e) {
            const target = e.target?.closest?.(selector);
            if (target && this.el.contains(target)) callback.call(target, e);
        }.bind(this));
        return this;
    }
    onScroll(callback) { if (!this.el) return this; this.el.addEventListener("scroll", callback); return this; }
    onMousewheel(callback) { if (!this.el) return this; this.el.addEventListener("wheel", callback); return this; }

    setCursor(cursor) {
        if (!this.el) return this;
        this.el.style.cursor = cursor;
        document.querySelectorAll("#luckysheetTableContent, #luckysheet-sheettable_0").forEach(el => el.style.cursor = cursor);
        return this;
    }

    setCursorDefault() {
        if (!this.el) return this;
        this.el.style.cursor = "default";
        document.querySelectorAll("#luckysheetTableContent, #luckysheet-sheettable_0").forEach(el => el.style.cursor = "default");
        return this;
    }

    onCellMousedown(callback) { if (!this.el) return this; this.el.addEventListener("mousedown", callback); return this; }
    onCellMouseup(callback) { if (!this.el) return this; this.el.addEventListener("mouseup", callback); return this; }
    onCellDblclick(callback) { if (!this.el) return this; this.el.addEventListener("dblclick", callback); return this; }

    find(selector) { if (!this.el) return null; return this.el.querySelector(selector); }
    closest(selector) { if (!this.el) return null; return this.el.closest(selector); }
}

export default new CellMain();
