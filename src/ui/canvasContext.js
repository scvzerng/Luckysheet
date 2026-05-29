class CanvasContext {
    constructor() { this._ctx = null; this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheetTableContent");
        return this._el;
    }

    getContext() {
        if (!this.el) return null;
        if (!this._ctx) {
            this._ctx = this.el.getContext("2d");
        }
        return this._ctx;
    }

    getHeight() { if (!this.el) return 0; return this.el.getBoundingClientRect().height; }
    exists() { return this.el !== null && document.body.contains(this.el); }
    invalidate() { this._ctx = null; }

    setAttr(attrs) {
        if (!this.el) return this;
        for (const [key, val] of Object.entries(attrs)) this.el.setAttribute(key, val);
        return this;
    }
    setCss(props) {
        if (!this.el) return this;
        for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v;
        return this;
    }
    setAttrAndCss(attrs, cssProps) {
        if (!this.el) return this;
        for (const [key, val] of Object.entries(attrs)) this.el.setAttribute(key, val);
        for (const [k, v] of Object.entries(cssProps)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v;
        return this;
    }
    getNativeElement() { if (!this.el) return null; return this.el; }

    setCanvasSize(width, height, cssWidth, cssHeight) {
        document.querySelectorAll("#luckysheetTableContent, #luckysheetTableContentF").forEach(el => {
            el.setAttribute("width", width);
            el.setAttribute("height", height);
            el.style.width = typeof cssWidth === 'number' ? cssWidth + 'px' : cssWidth;
            el.style.height = typeof cssHeight === 'number' ? cssHeight + 'px' : cssHeight;
        });
        this._ctx = null;
        return this;
    }

    initContext(attrs, cssProps) {
        if (!this.el) return null;
        for (const [key, val] of Object.entries(attrs)) this.el.setAttribute(key, val);
        for (const [k, v] of Object.entries(cssProps)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v;
        this._ctx = this.el.getContext("2d");
        return this._ctx;
    }
}

export default new CanvasContext();
