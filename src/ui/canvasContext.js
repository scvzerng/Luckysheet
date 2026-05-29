import $ from '../jquery-bridge.js';

class CanvasContext {
    constructor() { this._ctx = null; this._el = null; }

    get el() {
        if (!this._el || this._el.length === 0) this._el = $("#luckysheetTableContent");
        return this._el;
    }

    getContext() {
        if (!this._ctx) {
            this._ctx = this.el.get(0).getContext("2d");
        }
        return this._ctx;
    }

    getHeight() { return this.el.height(); }
    exists() { return this.el.length > 0; }
    invalidate() { this._ctx = null; }

    setAttr(attrs) { this.el.attr(attrs); return this; }
    setCss(props) { this.el.css(props); return this; }
    setAttrAndCss(attrs, cssProps) {
        this.el.attr(attrs).css(cssProps);
        return this;
    }
    getNativeElement() { return this.el.get(0); }

    setCanvasSize(width, height, cssWidth, cssHeight) {
        $("#luckysheetTableContent, #luckysheetTableContentF").attr({
            width: width,
            height: height
        }).css({
            width: cssWidth,
            height: cssHeight
        });
        return this;
    }

    initContext(attrs, cssProps) {
        return this.el.attr(attrs).css(cssProps).get(0).getContext("2d");
    }
}

export default new CanvasContext();
