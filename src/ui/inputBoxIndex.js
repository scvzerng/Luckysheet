class InputBoxIndex {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-input-box-index");
        return this._el;
    }

    hide() { this.el.style.display = 'none'; return this; }
    show() { this.el.style.display = ''; return this; }
    setCss(props) { for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
    setHtml(value) { this.el.innerHTML = value; return this; }
    getText() { return this.el.textContent; }
    find(selector) { return this.el.querySelector(selector); }
    setCellRef(text) { this.el.innerHTML = text; return this; }
    setSheetPrefix(sheetName) {
        const sheettxt = this.el.querySelector(".luckysheet-input-box-index-sheettxt");
        if (sheettxt) sheettxt.remove();
        this.el.insertAdjacentHTML('afterbegin', sheetName);
        this.el.style.display = '';
        return this;
    }
}

export default new InputBoxIndex();
