class SheetContainer {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-sheet-container-c"); return this._el; }

    append(html) { this.el.insertAdjacentHTML('beforeend', html); return this; }
    getScrollLeft() { return this.el.scrollLeft; }
    setScrollLeft(value) { this.el.scrollLeft = value; return this; }
    addClass(cls) { this.el.classList.add(cls); return this; }
    getWidth() { return this.el.getBoundingClientRect().width; }
    getScrollWidth() { return this.el.scrollWidth; }
    exists() { return this.el !== null && document.body.contains(this.el); }
    onMousewheel(callback) { this.el.addEventListener("wheel", callback); return this; }
    find(selector) { return this.el.querySelector(selector); }
    findVisible(selector) { return Array.from(this.el.querySelectorAll(selector)).filter(el => el.offsetWidth > 0); }
    getActiveSheetItem() { return this.el.querySelector(":scope > div.luckysheet-sheets-item-active"); }
}

export default new SheetContainer();
