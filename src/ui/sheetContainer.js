class SheetContainer {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-sheet-container-c"); return this._el; }

    append(html) { if (!this.el) return this; this.el.insertAdjacentHTML('beforeend', html); return this; }
    getScrollLeft() { if (!this.el) return 0; return this.el.scrollLeft; }
    setScrollLeft(value) { if (!this.el) return this; this.el.scrollLeft = value; return this; }
    addClass(cls) { if (!this.el) return this; this.el.classList.add(cls); return this; }
    getWidth() { if (!this.el) return 0; return this.el.getBoundingClientRect().width; }
    getScrollWidth() { if (!this.el) return 0; return this.el.scrollWidth; }
    exists() { return this.el !== null && document.body.contains(this.el); }
    onMousewheel(callback) { if (!this.el) return this; this.el.addEventListener("wheel", callback); return this; }
    find(selector) { if (!this.el) return null; return this.el.querySelector(selector); }
    findVisible(selector) { if (!this.el) return []; return Array.from(this.el.querySelectorAll(selector)).filter(el => el.offsetWidth > 0); }
    getActiveSheetItem() { if (!this.el) return null; return this.el.querySelector(":scope > div.luckysheet-sheets-item-active"); }
}

export default new SheetContainer();
