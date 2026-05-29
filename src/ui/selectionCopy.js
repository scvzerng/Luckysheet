import $ from '../jquery-bridge.js';

class SelectionCopy {
    constructor() { this._el = null; }
    get el() { if (!this._el || this._el.length === 0) this._el = $("#luckysheet-selection-copy"); return this._el; }

    setCss(props) { this.el.css(props); return this; }
    show() { this.el.show(); return this; }
    hide() { this.el.hide(); return this; }
    empty() { this.el.empty(); return this; }
    append(html) { this.el.append(html); return this; }
    isVisible() { return this.el.is(":visible"); }
}

export default new SelectionCopy();
