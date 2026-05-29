class GridWindow {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-grid-window-1"); return this._el; }

    getWidth() { if (!this.el) return 0; return this.el.getBoundingClientRect().width; }
    getHeight() { if (!this.el) return 0; return this.el.getBoundingClientRect().height; }
    append(html) { if (!this.el) return this; this.el.insertAdjacentHTML('beforeend', html); return this; }
    appendCanvas(canvasHtml) { if (!this.el) return this; this.el.insertAdjacentHTML('beforeend', canvasHtml); return this; }
    onMousewheel(callback) { if (!this.el) return this; this.el.addEventListener("wheel", callback); return this; }
    setCss(props) { if (!this.el) return this; for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
    find(selector) { if (!this.el) return null; return this.el.querySelector(selector); }
    removeCanvasExcept(selector) {
        if (!this.el) return this;
        const canvases = this.el.querySelectorAll(":scope > canvas");
        canvases.forEach(c => { if (!c.matches(selector)) c.remove(); });
        return this;
    }
    setCssBottom(value) { if (!this.el) return this; this.el.style.bottom = typeof value === 'number' ? value + 'px' : value; return this; }
}

export default new GridWindow();
