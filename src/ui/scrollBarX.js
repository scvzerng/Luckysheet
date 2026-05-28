import $ from '../jquery-bridge.js';

class ScrollBarX {
    constructor() { this._el = null; }

    get el() {
        if (!this._el) this._el = $("#luckysheet-scrollbar-x");
        return this._el;
    }

    getScrollLeft() { return this.el.scrollLeft(); }
    setScrollLeft(value) { this.el.scrollLeft(value); return this; }

    setHeight(value) { this.el.height(value); return this; }
    setWidth(value) { this.el.width(value); return this; }
    setCssLeft(value) { this.el.css("left", value); return this; }

    getScrollWidth() { return this.el[0].scrollWidth; }
    getOffsetWidth() { return this.el[0].offsetWidth; }

    onScroll(callback) { this.el.scroll(callback); return this; }
    onMousewheel(callback) { this.el.mousewheel(callback); return this; }

    setInnerDivWidth(value) {
        $("#luckysheet-scrollbar-x div").width(value);
        return this;
    }
}

export default new ScrollBarX();
