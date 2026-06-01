class InputBoxIndex {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-input-box-index");
        return this._el;
    }

    hide() { if (!this.el) return this; this.el.style.display = 'none'; return this; }
    show() { if (!this.el) return this; this.el.style.display = 'block'; return this; }
    setCss(props) { if (!this.el) return this; for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
    setHtml(value) { if (!this.el) return this; this.el.innerHTML = value; return this; }
    getText() { if (!this.el) return ''; return this.el.textContent; }
    find(selector) { if (!this.el) return null; return this.el.querySelector(selector); }
    setCellRef(text) { if (!this.el) return this; this.el.innerHTML = text; return this; }
    setSheetPrefix(sheetName) {
        if (!this.el) return this;
        const sheettxt = this.el.querySelector(".luckysheet-input-box-index-sheettxt");
        if (sheettxt) sheettxt.remove();
        this.el.insertAdjacentHTML('afterbegin', sheetName);
        this.el.style.display = 'block';
        return this;
    }
}

export default new InputBoxIndex();
