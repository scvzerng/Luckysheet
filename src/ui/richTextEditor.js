import $ from '../jquery-bridge.js';

class RichTextEditor {
    constructor() { this._el = null; }

    get el() {
        if (!this._el) this._el = $("#luckysheet-rich-text-editor");
        return this._el;
    }

    getHtml() { return this.el.html(); }
    setHtml(value) { this.el.html(value); return this; }
    getText() { return this.el.text(); }

    focus() { this.el.focus(); return this; }
    blur() { this.el.blur(); return this; }
    select() { this.el.select(); return this; }

    setCss(props) { this.el.css(props); return this; }
    find(selector) { return this.el.find(selector); }

    onMouseup(callback) { this.el.mouseup(callback); return this; }
    getNativeElement() { return this.el[0]; }
}

export default new RichTextEditor();
