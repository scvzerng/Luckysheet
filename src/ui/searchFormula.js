class SearchFormula {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-search-formula"); return this._el; }
    hide() { this.el.style.display = 'none'; return this; }
    show() { this.el.style.display = ''; return this; }
    remove() { this.el.remove(); this._el = null; return this; }
    setCss(props) { for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
    find(selector) { return this.el.querySelector(selector); }
    isVisible() { return this.el.offsetWidth > 0; }
}

export default new SearchFormula();
