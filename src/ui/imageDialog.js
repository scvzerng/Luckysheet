import $ from '../jquery-bridge.js';

class ImageDialog {
    constructor(selector) {
        this._selector = selector;
        this._el = null;
    }

    get el() { if (!this._el || this._el.length === 0) this._el = $(this._selector); return this._el; }

    isVisible() { return this.el.is(":visible"); }
    show() { this.el.show(); return this; }
    showAt(props) { this.el.css(props).show(); return this; }
    hide() { this.el.hide(); return this; }
    setCss(props) { this.el.css(props); return this; }
    getOffset() { return this.el.offset(); }
    getPosition() { return this.el.position(); }
    getWidth() { return this.el.width(); }
    getHeight() { return this.el.height(); }
    offEvent(namespace) { this.el.off(namespace); return this; }
    onEvent(namespace, callback) { this.el.on(namespace, callback); return this; }
}

const imageDialog = {
    active: new ImageDialog("#luckysheet-modal-dialog-activeImage"),
    cropping: new ImageDialog("#luckysheet-modal-dialog-cropping"),
    slider: new ImageDialog("#luckysheet-modal-dialog-slider-imageCtrl"),
};

export default imageDialog;
