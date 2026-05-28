import $ from '../jquery-bridge.js';

class RightClickMenu {
    constructor() { this._el = null; }

    get el() {
        if (!this._el) this._el = $("#luckysheet-rightclick-menu");
        return this._el;
    }

    hide() { this.el.hide(); return this; }
    show() { this.el.show(); return this; }
    showAt(x, y) {
        let winH = $(window).height(), winW = $(window).width();
        let menuW = this.el.width(), menuH = this.el.height();
        let top = y, left = x;
        if (x + menuW > winW) { left = x - menuW; }
        if (y + menuH > winH) { top = y - menuH; }
        if (top < 0) { top = 0; }
        this.el.css({ top: top, left: left }).show();
        return this;
    }
}

export default new RightClickMenu();
