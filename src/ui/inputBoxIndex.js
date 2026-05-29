import $ from '../jquery-bridge.js';

class InputBoxIndex {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || this._el.length === 0) this._el = $("#luckysheet-input-box-index");
        return this._el;
    }

    hide() { this.el.hide(); return this; }
    show() { this.el.show(); return this; }
    setCss(props) { this.el.css(props); return this; }
    setHtml(value) { this.el.html(value); return this; }
    getText() { return this.el.text(); }
    find(selector) { return this.el.find(selector); }
    setCellRef(text) { this.el.html(text); return this; }
    setSheetPrefix(sheetName) {
        this.el.find(".luckysheet-input-box-index-sheettxt").remove().end().prepend(sheetName).show();
        return this;
    }
}

export default new InputBoxIndex();
