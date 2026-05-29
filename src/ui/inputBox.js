class InputBox {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-input-box");
        return this._el;
    }

    getCss(prop) { if (!this.el) return ''; return getComputedStyle(this.el)[prop]; }
    getTop() { if (!this.el) return 0; return parseInt(getComputedStyle(this.el).top); }
    setCss(props) { if (!this.el) return this; for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }

    setStyleCssText(value) { if (!this.el) return this; this.el.style.cssText = value; return this; }
    setStyleBackground(value) { if (!this.el) return this; this.el.style.background = value; return this; }
    setStyleBackgroundColor(value) { if (!this.el) return this; this.el.style.backgroundColor = value; return this; }

    getWidth() { if (!this.el) return 0; return this.el.getBoundingClientRect().width; }
    hide() { if (!this.el) return this; this.el.style.display = 'none'; return this; }
    resetStyle() { if (!this.el) return this; this.el.removeAttribute("style"); return this; }
    click() { if (!this.el) return this; this.el.click(); return this; }
    removeParent() { if (this.el && this.el.parentElement) this.el.parentElement.remove(); this._el = null; return this; }

    find(selector) { if (!this.el) return null; return this.el.querySelector(selector); }
    getNativeElement() { if (!this.el) return null; return this.el; }
    getSelector() { return '#luckysheet-input-box'; }
}

export default new InputBox();
