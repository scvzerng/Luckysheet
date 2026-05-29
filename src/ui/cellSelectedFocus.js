class CellSelectedFocus {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-cell-selected-focus"); return this._el; }

    showAt(props) {
        this.el.style.display = '';
        for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v;
        return this;
    }
    hide() { this.el.style.display = 'none'; return this; }
    setCss(props) { for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
}

export default new CellSelectedFocus();
