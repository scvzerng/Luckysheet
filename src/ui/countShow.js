class CountShow {
    constructor(selector) {
        this._selector = selector;
        this._el = null;
    }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.querySelector(this._selector); return this._el; }

    hide() { if (!this.el) return this; this.el.style.display = 'none'; return this; }
    showAt(props, content) {
        if (!this.el) return this;
        for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v;
        this.el.innerHTML = content;
        return this;
    }
    isVisible() { if (!this.el) return false; return this.el.offsetWidth > 0; }
}

const countShow = {
    row: new CountShow("#luckysheet-row-count-show"),
    column: new CountShow("#luckysheet-column-count-show"),
};

export default countShow;
