class ScrollBarX {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-scrollbar-x");
        return this._el;
    }

    getScrollLeft() { if (!this.el) return 0; return this.el.scrollLeft; }
    setScrollLeft(value) { if (!this.el) return this; this.el.scrollLeft = value; return this; }

    setHeight(value) { if (!this.el) return this; this.el.style.height = typeof value === 'number' ? value + 'px' : value; return this; }
    setWidth(value) { if (!this.el) return this; this.el.style.width = typeof value === 'number' ? value + 'px' : value; return this; }
    setCssLeft(value) { if (!this.el) return this; this.el.style.left = typeof value === 'number' ? value + 'px' : value; return this; }

    getScrollWidth() { if (!this.el) return 0; return this.el.scrollWidth; }
    getOffsetWidth() { if (!this.el) return 0; return this.el.offsetWidth; }

    onScroll(callback) { if (!this.el) return this; this.el.addEventListener("scroll", callback); return this; }
    onMousewheel(callback) { if (!this.el) return this; this.el.addEventListener("wheel", callback); return this; }

    setInnerDivWidth(value) {
        const div = document.querySelector("#luckysheet-scrollbar-x div");
        if (div) div.style.width = typeof value === 'number' ? value + 'px' : value;
        return this;
    }
}

export default new ScrollBarX();
