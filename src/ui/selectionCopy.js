class SelectionCopy {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-selection-copy"); return this._el; }

    setCss(props) { if (!this.el) return this; for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
    show() { if (!this.el) return this; this.el.style.display = ''; return this; }
    hide() { if (!this.el) return this; this.el.style.display = 'none'; return this; }
    empty() { if (!this.el) return this; this.el.innerHTML = ''; return this; }
    append(html) { if (!this.el) return this; this.el.insertAdjacentHTML('beforeend', html); return this; }
    isVisible() { if (!this.el) return false; return this.el.offsetWidth > 0; }
}

export default new SelectionCopy();
