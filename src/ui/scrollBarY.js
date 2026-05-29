class ScrollBarY {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-scrollbar-y");
        return this._el;
    }

    getScrollTop() { return this.el.scrollTop; }
    setScrollTop(value) { this.el.scrollTop = value; return this; }

    setHeight(value) { this.el.style.height = typeof value === 'number' ? value + 'px' : value; return this; }
    setWidth(value) { this.el.style.width = typeof value === 'number' ? value + 'px' : value; return this; }

    getScrollHeight() { return this.el.scrollHeight; }
    getOffsetHeight() { return this.el.offsetHeight; }

    onScroll(callback) { this.el.addEventListener("scroll", callback); return this; }
    onMousewheel(callback) { this.el.addEventListener("wheel", callback); return this; }

    setInnerDivHeight(value) {
        const div = document.querySelector("#luckysheet-scrollbar-y div");
        if (div) div.style.height = typeof value === 'number' ? value + 'px' : value;
        return this;
    }
}

export default new ScrollBarY();
