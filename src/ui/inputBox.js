class InputBox {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-input-box");
        return this._el;
    }

    getCss(prop) { return getComputedStyle(this.el)[prop]; }
    getTop() { return parseInt(getComputedStyle(this.el).top); }
    setCss(props) { for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }

    setStyleCssText(value) { this.el.style.cssText = value; return this; }
    setStyleBackground(value) { this.el.style.background = value; return this; }
    setStyleBackgroundColor(value) { this.el.style.backgroundColor = value; return this; }

    getWidth() { return this.el.getBoundingClientRect().width; }
    hide() { this.el.style.display = 'none'; return this; }
    resetStyle() { this.el.removeAttribute("style"); return this; }
    click() { this.el.click(); return this; }
    removeParent() { if (this.el && this.el.parentElement) this.el.parentElement.remove(); this._el = null; return this; }

    find(selector) { return this.el.querySelector(selector); }
    getNativeElement() { return this.el; }
    getSelector() { return '#luckysheet-input-box'; }
}

export default new InputBox();
