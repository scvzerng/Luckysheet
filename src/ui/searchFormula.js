class SearchFormula {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-search-formula"); return this._el; }
    hide() { if (this.el) this.el.style.display = 'none'; return this; }
    show() { if (this.el) this.el.style.display = ''; return this; }
    remove() { if (this.el) this.el.remove(); this._el = null; return this; }
    setCss(props) { if (this.el) { for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; } return this; }
    find(selector) { return this.el?.querySelector(selector) || null; }
    isVisible() { return this.el ? this.el.offsetWidth > 0 : false; }
}

export default new SearchFormula();
