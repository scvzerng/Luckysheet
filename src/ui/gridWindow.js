import $ from '../jquery-bridge.js';

class GridWindow {
    constructor() { this._el = null; }
    get el() { if (!this._el) this._el = $("#luckysheet-grid-window-1"); return this._el; }

    getWidth() { return this.el.width(); }
    getHeight() { return this.el.height(); }
    append(html) { this.el.append(html); return this; }
    onMousewheel(callback) { this.el.mousewheel(callback); return this; }
}

export default new GridWindow();
