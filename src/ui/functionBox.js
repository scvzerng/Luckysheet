import $ from '../jquery-bridge.js';

class FunctionBox {
    constructor() { this._el = null; }
    get el() { if (!this._el || this._el.length === 0) this._el = $("#luckysheet-functionbox-cell"); return this._el; }

    getHtml() { return this.el.html(); }
    setHtml(value) { this.el.html(value); return this; }
    focus() { this.el.focus(); return this; }
    blur() { this.el.blur(); return this; }
    isVisible() { return this.el.is(":visible"); }
}

export default new FunctionBox();
