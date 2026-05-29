import $ from '../jquery-bridge.js';

class SearchFormula {
    constructor() { this._el = null; }
    get el() { if (!this._el || this._el.length === 0) this._el = $("#luckysheet-search-formula"); return this._el; }
    hide() { this.el.hide(); return this; }
    show() { this.el.show(); return this; }
    remove() { this.el.remove(); this._el = null; return this; }
    setCss(props) { this.el.css(props); return this; }
    find(selector) { return this.el.find(selector); }
    isVisible() { return this.el.is(":visible"); }
}

export default new SearchFormula();
