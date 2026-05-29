import $ from '../jquery-bridge.js';

class CellSelectedFocus {
    constructor() { this._el = null; }
    get el() { if (!this._el || this._el.length === 0) this._el = $("#luckysheet-cell-selected-focus"); return this._el; }

    showAt(props) { this.el.show().css(props); return this; }
    hide() { this.el.hide(); return this; }
    setCss(props) { this.el.css(props); return this; }
}

export default new CellSelectedFocus();
