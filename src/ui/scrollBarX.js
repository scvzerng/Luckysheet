class ScrollBarX {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-scrollbar-x");
        return this._el;
    }

    getScrollLeft() { return this.el.scrollLeft; }
    setScrollLeft(value) { this.el.scrollLeft = value; return this; }

    setHeight(value) { this.el.style.height = typeof value === 'number' ? value + 'px' : value; return this; }
    setWidth(value) { this.el.style.width = typeof value === 'number' ? value + 'px' : value; return this; }
    setCssLeft(value) { this.el.style.left = typeof value === 'number' ? value + 'px' : value; return this; }

    getScrollWidth() { return this.el.scrollWidth; }
    getOffsetWidth() { return this.el.offsetWidth; }

    onScroll(callback) { this.el.addEventListener("scroll", callback); return this; }
    onMousewheel(callback) { this.el.addEventListener("wheel", callback); return this; }

    setInnerDivWidth(value) {
        const div = document.querySelector("#luckysheet-scrollbar-x div");
        if (div) div.style.width = typeof value === 'number' ? value + 'px' : value;
        return this;
    }
}

export default new ScrollBarX();
