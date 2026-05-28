import $ from '../jquery-bridge.js';

class FormulaDialog {
    constructor(selector) {
        this._selector = selector;
        this._el = null;
    }

    get el() {
        if (!this._el) this._el = $(this._selector);
        return this._el;
    }

    isVisible() { return this.el.is(":visible"); }
    hide() { this.el.hide(); return this; }
    show() { this.el.show(); return this; }
    showAt(props) { this.el.css(props).show(); return this; }
    remove() { this.el.remove(); this._el = null; return this; }
    setContentCss(props) {
        this.el.find(".luckysheet-modal-dialog-content").css(props).end();
        return this;
    }
    getLength() { return this.el.length; }
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
