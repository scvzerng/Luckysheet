class RightClickMenu {
    constructor() { this._el = null; }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-rightclick-menu");
        return this._el;
    }

    hide() { this.el.style.display = 'none'; return this; }
    show() { this.el.style.display = ''; return this; }
    showAt(x, y) {
        let winH = document.documentElement.clientHeight, winW = document.documentElement.clientWidth;
        let menuW = this.el.getBoundingClientRect().width, menuH = this.el.getBoundingClientRect().height;
        let top = y, left = x;
        if (x + menuW > winW) { left = x - menuW; }
        if (y + menuH > winH) { top = y - menuH; }
        if (top < 0) { top = 0; }
        this.el.style.top = top + 'px';
        this.el.style.left = left + 'px';
        this.el.style.display = '';
        return this;
    }
    find(selector) { return this.el.querySelector(selector); }
    findText(selector, text) { const el = this.el.querySelector(selector); if (el) el.textContent = text; return this; }
}

export default new RightClickMenu();
