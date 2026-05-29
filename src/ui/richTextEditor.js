class RichTextEditor {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-rich-text-editor");
        return this._el;
    }

    getHtml() { return this.el.innerHTML; }
    setHtml(value) { this.el.innerHTML = value; return this; }
    getText() { return this.el.textContent; }

    focus() { this.el.focus(); return this; }
    blur() { this.el.blur(); return this; }
    select() { this.el.select(); return this; }

    setCss(props) { for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
    find(selector) { return this.el.querySelector(selector); }

    onMouseup(callback) { this.el.addEventListener("mouseup", callback); return this; }
    getNativeElement() { return this.el; }
}

export default new RichTextEditor();
