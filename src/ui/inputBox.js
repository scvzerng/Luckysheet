import $ from '../jquery-bridge.js';

class InputBox {
    constructor() { this._el = null; }

    get el() {
        if (!this._el) this._el = $("#luckysheet-input-box");
        return this._el;
    }

    getCss(prop) { return this.el.css(prop); }
    getTop() { return parseInt(this.el.css("top")); }
    setCss(props) { this.el.css(props); return this; }

    setStyleCssText(value) { this.el.get(0).style.cssText = value; return this; }
    setStyleBackground(value) { this.el.get(0).style.background = value; return this; }
    setStyleBackgroundColor(value) { this.el.get(0).style.backgroundColor = value; return this; }

    getWidth() { return this.el.width(); }
    hide() { this.el.hide(); return this; }
    resetStyle() { this.el.removeAttr("style"); return this; }
    click() { this.el.click(); return this; }
    removeParent() { this.el.parent().remove(); return this; }
}

export default new InputBox();
