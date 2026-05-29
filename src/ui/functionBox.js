class FunctionBox {
    constructor() { this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.getElementById("luckysheet-functionbox-cell"); return this._el; }

    getHtml() { return this.el.innerHTML; }
    setHtml(value) { this.el.innerHTML = value; return this; }
    focus() { this.el.focus(); return this; }
    blur() { this.el.blur(); return this; }
    isVisible() { return this.el.offsetWidth > 0; }
    getNativeElement() { return this.el; }
    find(selector) { return this.el.querySelector(selector); }
    confirmClick() { document.getElementById("luckysheet-wa-functionbox-confirm").click(); return this; }
    cancelClick() { document.getElementById("luckysheet-wa-functionbox-cancel").click(); return this; }
    setActive() {
        document.querySelectorAll("#luckysheet-wa-functionbox-cancel, #luckysheet-wa-functionbox-confirm").forEach(el => el.classList.add("luckysheet-wa-calculate-active"));
        return this;
    }
    unsetActive() {
        document.querySelectorAll("#luckysheet-wa-functionbox-cancel, #luckysheet-wa-functionbox-confirm").forEach(el => el.classList.remove("luckysheet-wa-calculate-active"));
        return this;
    }
    onConfirmClick(callback) { document.getElementById("luckysheet-wa-functionbox-confirm").addEventListener("click", callback); return this; }
    onCancelClick(callback) { document.getElementById("luckysheet-wa-functionbox-cancel").addEventListener("click", callback); return this; }
}

export default new FunctionBox();
