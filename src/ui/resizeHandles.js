class ResizeHandle {
    constructor(selector) {
        this._selector = selector;
        this._el = null;
    }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.querySelector(this._selector); return this._el; }

    setCss(props) { if (!this.el) return this; for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
    hide() { if (!this.el) return this; this.el.style.display = 'none'; return this; }
    show() { if (!this.el) return this; this.el.style.display = 'block'; return this; }
    addClass(cls) { if (!this.el) return this; this.el.classList.add(cls); return this; }
    removeClass(cls) { if (!this.el) return this; this.el.classList.remove(cls); return this; }
    onMousedown(callback) { if (!this.el) return this; this.el.addEventListener("mousedown", callback); return this; }
    onDblclick(callback) { if (!this.el) return this; this.el.addEventListener("dblclick", callback); return this; }
}

const resizeHandles = {
    colChangeSize: new ResizeHandle("#luckysheet-cols-change-size"),
    rowChangeSize: new ResizeHandle("#luckysheet-rows-change-size"),
    changeSizeLine: new ResizeHandle("#luckysheet-change-size-line"),
    colHover: new ResizeHandle("#luckysheet-cols-h-hover"),
    rowHover: new ResizeHandle("#luckysheet-rows-h-hover"),
    sheetTable: new ResizeHandle("#luckysheet-sheettable_0"),
};

export default resizeHandles;
