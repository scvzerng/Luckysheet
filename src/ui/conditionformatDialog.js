class ConditionformatDialog {
    constructor(selector) { this._selector = selector; this._el = null; }
    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.querySelector(this._selector); return this._el; }
    hide() { if (this.el) this.el.style.display = 'none'; return this; }
    show() { if (this.el) this.el.style.display = ''; return this; }
    remove() { if (this.el) this.el.remove(); this._el = null; return this; }
    find(selector) { return this.el?.querySelector(selector) || null; }
    isVisible() { return this.el ? this.el.offsetWidth > 0 : false; }
    showAt(props) { if (this.el) { for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; this.el.style.display = ''; } return this; }
}

const conditionformatDialog = {
    main: new ConditionformatDialog("#luckysheet-conditionformat-dialog"),
    adminRule: new ConditionformatDialog("#luckysheet-administerRule-dialog"),
    newRule: new ConditionformatDialog("#luckysheet-newConditionRule-dialog"),
    editRule: new ConditionformatDialog("#luckysheet-editorConditionRule-dialog"),
};

export default conditionformatDialog;
