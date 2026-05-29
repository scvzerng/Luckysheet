import $ from '../jquery-bridge.js';

class FunctionBox {
    constructor() { this._el = null; }
    get el() { if (!this._el || this._el.length === 0) this._el = $("#luckysheet-functionbox-cell"); return this._el; }

    getHtml() { return this.el.html(); }
    setHtml(value) { this.el.html(value); return this; }
    focus() { this.el.focus(); return this; }
    blur() { this.el.blur(); return this; }
    isVisible() { return this.el.is(":visible"); }
    getNativeElement() { return this.el[0]; }
    find(selector) { return this.el.find(selector); }
    confirmClick() { $("#luckysheet-wa-functionbox-confirm").click(); return this; }
    cancelClick() { $("#luckysheet-wa-functionbox-cancel").click(); return this; }
    setActive() { $("#luckysheet-wa-functionbox-cancel, #luckysheet-wa-functionbox-confirm").addClass("luckysheet-wa-calculate-active"); return this; }
    unsetActive() { $("#luckysheet-wa-functionbox-cancel, #luckysheet-wa-functionbox-confirm").removeClass("luckysheet-wa-calculate-active"); return this; }
    onConfirmClick(callback) { $("#luckysheet-wa-functionbox-confirm").click(callback); return this; }
    onCancelClick(callback) { $("#luckysheet-wa-functionbox-cancel").click(callback); return this; }
}

export default new FunctionBox();
