class ImageDialog {
    constructor(selector) {
        this._selector = selector;
        this._el = null;
        this._handlers = {};
    }

    get el() { if (!this._el || !document.body.contains(this._el)) this._el = document.querySelector(this._selector); return this._el; }

    isVisible() { if (!this.el) return false; return this.el.offsetWidth > 0; }
    show() { if (!this.el) return this; this.el.style.display = ''; return this; }
    showAt(props) { if (!this.el) return this; for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; this.el.style.display = ''; return this; }
    hide() { if (!this.el) return this; this.el.style.display = 'none'; return this; }
    setCss(props) { if (!this.el) return this; for (const [k, v] of Object.entries(props)) this.el.style[k] = typeof v === 'number' ? v + 'px' : v; return this; }
    getOffset() {
        if (!this.el) return {top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0};
        const rect = this.el.getBoundingClientRect();
        return { top: rect.top + window.pageYOffset, left: rect.left + window.pageXOffset };
    }
    getPosition() { if (!this.el) return {top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0}; return { top: this.el.offsetTop, left: this.el.offsetLeft }; }
    getWidth() { if (!this.el) return 0; return this.el.getBoundingClientRect().width; }
    getHeight() { if (!this.el) return 0; return this.el.getBoundingClientRect().height; }
    offEvent(namespace) {
        if (!this.el) return this;
        const ns = namespace.replace(/^\./, '');
        if (this._handlers[ns]) {
            this._handlers[ns].forEach(({event, callback}) => {
                this.el.removeEventListener(event, callback);
            });
            delete this._handlers[ns];
        }
        return this;
    }
    onEvent(eventStr, callback) {
        if (!this.el) return this;
        const parts = eventStr.split('.');
        const event = parts[0];
        const namespace = parts.slice(1).join('.');
        if (!this._handlers[namespace]) this._handlers[namespace] = [];
        this._handlers[namespace].push({event, callback});
        this.el.addEventListener(event, callback);
        return this;
    }
}

const imageDialog = {
    active: new ImageDialog("#luckysheet-modal-dialog-activeImage"),
    cropping: new ImageDialog("#luckysheet-modal-dialog-cropping"),
    slider: new ImageDialog("#luckysheet-modal-dialog-slider-imageCtrl"),
};

export default imageDialog;
