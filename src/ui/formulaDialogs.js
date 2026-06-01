class FormulaDialog {
    constructor(selector) {
        this._selector = selector;
        this._el = null;
    }

    get el() {
        if (!this._el || !document.body.contains(this._el)) this._el = document.querySelector(this._selector);
        return this._el;
    }

    isVisible() { return this.el ? this.el.offsetWidth > 0 : false; }
    hide() { if (this.el) this.el.style.display = 'none'; return this; }
    show() { if (this.el) this.el.style.display = 'block'; return this; }
    showAt(props) { if (this.el) { for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; this.el.style.display = 'block'; } return this; }
    remove() { if (this.el) this.el.remove(); this._el = null; return this; }
    setContentCss(props) {
        const content = this.el?.querySelector(".luckysheet-modal-dialog-content");
        if (content) {
            for (const [k, v] of Object.entries(props)) content.style[k] = typeof v === 'number' ? v + 'px' : v;
        }
        return this;
    }
    getLength() { return this.el ? 1 : 0; }
    setCss(props) { if (this.el) { for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; } return this; }
    find(selector) { return this.el?.querySelector(selector) || null; }
}

const formulaDialogs = {
    multiRange: new FormulaDialog("#luckysheet-multiRange-dialog"),
    singleRange: new FormulaDialog("#luckysheet-singleRange-dialog"),
    searchParm: new FormulaDialog("#luckysheet-search-formula-parm"),
    searchParmSelect: new FormulaDialog("#luckysheet-search-formula-parm-select"),
    ifFormulaMultiRange: new FormulaDialog("#luckysheet-ifFormulaGenerator-multiRange-dialog"),
    ifFormulaSingleRange: new FormulaDialog("#luckysheet-ifFormulaGenerator-singleRange-dialog"),
    ifFormulaDialog: new FormulaDialog("#luckysheet-ifFormulaGenerator-dialog"),
    ifFormulaInfo: new FormulaDialog("#luckysheet-ifFormulaGenerator-info"),
    formulaHelp: new FormulaDialog("#luckysheet-formula-help-c"),
    formulaSearchC: new FormulaDialog("#luckysheet-formula-search-c"),
};

export default formulaDialogs;
