class ScrollBarY {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-scrollbar-y");
        return this._el;
    }

    getScrollTop() { if (!this.el) return 0; return this.el.scrollTop; }
    setScrollTop(value) { if (!this.el) return this; this.el.scrollTop = value; return this; }

    setHeight(value) { if (!this.el) return this; this.el.style.height = typeof value === 'number' ? value + 'px' : value; return this; }
    setWidth(value) { if (!this.el) return this; this.el.style.width = typeof value === 'number' ? value + 'px' : value; return this; }

    getScrollHeight() { if (!this.el) return 0; return this.el.scrollHeight; }
    getOffsetHeight() { if (!this.el) return 0; return this.el.offsetHeight; }

    onScroll(callback) { if (!this.el) return this; this.el.addEventListener("scroll", callback); return this; }
    onMousewheel(callback) { if (!this.el) return this; this.el.addEventListener("wheel", callback); return this; }

    setInnerDivHeight(value) {
        const div = document.querySelector("#luckysheet-scrollbar-y div");
        if (div) div.style.height = typeof value === 'number' ? value + 'px' : value;
        return this;
    }
}

export default new ScrollBarY();
