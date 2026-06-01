class FormulaRangeSelect {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-formula-functionrange-select"); return this._el; }

    hide() { if (!this.el) return this; this.el.style.display = 'none'; return this; }
    showAt(props) { if (!this.el) return this; for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; this.el.style.display = 'block'; return this; }
    setCss(props) { if (!this.el) return this; for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
    isVisible() { if (!this.el) return false; return this.el.offsetWidth > 0; }
}

export default new FormulaRangeSelect();
