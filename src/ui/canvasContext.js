import $ from '../jquery-bridge.js';

class CanvasContext {
    constructor() { this._ctx = null; }

    getContext() {
        if (!this._ctx) {
            this._ctx = $("#luckysheetTableContent").get(0).getContext("2d");
        }
        return this._ctx;
    }

    getHeight() { return $("#luckysheetTableContent").height(); }
    exists() { return $("#luckysheetTableContent").length > 0; }

    invalidate() { this._ctx = null; }
}

export default new CanvasContext();
