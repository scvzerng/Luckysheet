import $ from '../jquery-bridge.js';

class CountShow {
    constructor(selector) {
        this._selector = selector;
        this._el = null;
    }
    get el() { if (!this._el || this._el.length === 0) this._el = $(this._selector); return this._el; }

    hide() { this.el.hide(); return this; }
    showAt(props, content) { this.el.css(props).html(content); return this; }
    isVisible() { return this.el.is(":visible"); }
}

const countShow = {
    row: new CountShow("#luckysheet-row-count-show"),
    column: new CountShow("#luckysheet-column-count-show"),
};

export default countShow;
