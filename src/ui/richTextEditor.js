class RichTextEditor {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-rich-text-editor");
        return this._el;
    }

    getHtml() { if (!this.el) return ''; return this.el.innerHTML; }
    setHtml(value) { if (!this.el) return this; this.el.innerHTML = value; return this; }
    getText() { if (!this.el) return ''; return this.el.textContent; }

    focus() { if (!this.el) return this; this.el.focus(); return this; }
    blur() { if (!this.el) return this; this.el.blur(); return this; }
    select() { if (!this.el) return this; this.el.select(); return this; }

    setCss(props) { if (!this.el) return this; for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
    find(selector) { if (!this.el) return null; return this.el.querySelector(selector); }

    onMouseup(callback) { if (!this.el) return this; this.el.addEventListener("mouseup", callback); return this; }
    getNativeElement() { if (!this.el) return null; return this.el; }
}

export default new RichTextEditor();
