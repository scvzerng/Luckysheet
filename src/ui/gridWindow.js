class GridWindow {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-grid-window-1"); return this._el; }

    getWidth() { return this.el.getBoundingClientRect().width; }
    getHeight() { return this.el.getBoundingClientRect().height; }
    append(html) { this.el.insertAdjacentHTML('beforeend', html); return this; }
    appendCanvas(canvasHtml) { this.el.insertAdjacentHTML('beforeend', canvasHtml); return this; }
    onMousewheel(callback) { this.el.addEventListener("wheel", callback); return this; }
    setCss(props) { for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
    find(selector) { return this.el.querySelector(selector); }
    removeCanvasExcept(selector) {
        const canvases = this.el.querySelectorAll(":scope > canvas");
        canvases.forEach(c => { if (!c.matches(selector)) c.remove(); });
        return this;
    }
    setCssBottom(value) { this.el.style.bottom = typeof value === 'number' ? value + 'px' : value; return this; }
}

export default new GridWindow();
