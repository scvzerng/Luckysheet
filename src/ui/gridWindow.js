import $ from '../jquery-bridge.js';

class GridWindow {
    constructor() { this._el = null; }
    get el() { if (!this._el || this._el.length === 0) this._el = $("#luckysheet-grid-window-1"); return this._el; }

    getWidth() { return this.el.width(); }
    getHeight() { return this.el.height(); }
    append(html) { this.el.append(html); return this; }
    appendCanvas(canvasHtml) { $(canvasHtml).appendTo(this.el); return this; }
    onMousewheel(callback) { this.el.mousewheel(callback); return this; }
    setCss(props) { this.el.css(props); return this; }
    find(selector) { return this.el.find(selector); }
    removeCanvasExcept(selector) {
        this.el.find("> canvas").not(selector).remove();
        return this;
    }
    setCssBottom(value) { this.el.css("bottom", value); return this; }
}

export default new GridWindow();
