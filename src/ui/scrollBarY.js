import $ from '../jquery-bridge.js';

class ScrollBarY {
    constructor() { this._el = null; }

    get el() {
        if (!this._el) this._el = $("#luckysheet-scrollbar-y");
        return this._el;
    }

    getScrollTop() { return this.el.scrollTop(); }
    setScrollTop(value) { this.el.scrollTop(value); return this; }

    setHeight(value) { this.el.height(value); return this; }
    setWidth(value) { this.el.width(value); return this; }

    getScrollHeight() { return this.el[0].scrollHeight; }
    getOffsetHeight() { return this.el[0].offsetHeight; }

    onScroll(callback) { this.el.scroll(callback); return this; }
    onMousewheel(callback) { this.el.mousewheel(callback); return this; }

    setInnerDivHeight(value) {
        $("#luckysheet-scrollbar-y div").height(value);
        return this;
    }
}

export default new ScrollBarY();
