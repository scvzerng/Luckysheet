class FormulaRangeSelect {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-formula-functionrange-select"); return this._el; }

    hide() { this.el.style.display = 'none'; return this; }
    showAt(props) { for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; this.el.style.display = ''; return this; }
    setCss(props) { for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
    isVisible() { return this.el.offsetWidth > 0; }
}

export default new FormulaRangeSelect();
