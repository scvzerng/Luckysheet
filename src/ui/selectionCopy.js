class SelectionCopy {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-selection-copy"); return this._el; }

    setCss(props) { for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
    show() { this.el.style.display = ''; return this; }
    hide() { this.el.style.display = 'none'; return this; }
    empty() { this.el.innerHTML = ''; return this; }
    append(html) { this.el.insertAdjacentHTML('beforeend', html); return this; }
    isVisible() { return this.el.offsetWidth > 0; }
}

export default new SelectionCopy();
