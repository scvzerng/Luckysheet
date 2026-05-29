import $ from '../jquery-bridge.js';

class FormulaRangeSelect {
    constructor() { this._el = null; }
    get el() { if (!this._el || this._el.length === 0) this._el = $("#luckysheet-formula-functionrange-select"); return this._el; }

    hide() { this.el.hide(); return this; }
    showAt(props) { this.el.css(props).show(); return this; }
    setCss(props) { this.el.css(props); return this; }
    isVisible() { return this.el.is(":visible"); }
}

export default new FormulaRangeSelect();
