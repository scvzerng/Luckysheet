import $ from '../jquery-bridge.js';

class ConditionformatDialog {
    constructor(selector) { this._selector = selector; this._el = null; }
    get el() { if (!this._el || this._el.length === 0 || this._el.closest("body").length === 0) this._el = $(this._selector); return this._el; }
    hide() { this.el.hide(); return this; }
    show() { this.el.show(); return this; }
    remove() { this.el.remove(); this._el = null; return this; }
    find(selector) { return this.el.find(selector); }
    isVisible() { return this.el.is(":visible"); }
    showAt(props) { this.el.css(props).show(); return this; }
}

const conditionformatDialog = {
    main: new ConditionformatDialog("#luckysheet-conditionformat-dialog"),
    adminRule: new ConditionformatDialog("#luckysheet-administerRule-dialog"),
    newRule: new ConditionformatDialog("#luckysheet-newConditionRule-dialog"),
    editRule: new ConditionformatDialog("#luckysheet-editorConditionRule-dialog"),
};

export default conditionformatDialog;
