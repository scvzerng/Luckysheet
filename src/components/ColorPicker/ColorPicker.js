import { normalizeColor, Color } from './colorUtils';
import { createPaletteView } from './PaletteView';
import { createCustomView } from './CustomView';

const pickerInstances = new WeakMap();

export function createColorPicker(element, options) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    if (!element) return null;

    const existing = pickerInstances.get(element);
    if (existing) existing.destroy();

    const picker = new ColorPicker(element, options);
    pickerInstances.set(element, picker);
    return picker;
}

export function getPicker(element) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    return element ? pickerInstances.get(element) : null;
}

class ColorPicker {
    constructor(element, options) {
        this.el = element;
        this.mountEl = element;
        this.options = options || {};
        this.currentColor = normalizeColor(options.color || '#000000');
        this.paletteView = null;
        this.customView = null;
        this.customContainer = null;
        this.isFlat = this.options.flat !== false;
        this.showPaletteOnly = this.options.showPaletteOnly === true;
        this.hideAfterPaletteSelect = this.options.hideAfterPaletteSelect !== false;
        this.destroyed = false;

        if (this.el.tagName === 'INPUT' || this.el.tagName === 'TEXTAREA') {
            this.el.style.display = 'none';
            this.mountEl = this.el.parentElement || this.el;
        }

        if (this.isFlat) {
            this._renderFlat();
        } else {
            this._renderDropdown();
        }
    }

    _renderFlat() {
        this.container = document.createElement('div');
        this.container.className = 'lkcp-container lkcp-flat luckysheet-mousedown-cancel';

        if (this.showPaletteOnly) {
            this.paletteView = createPaletteView(this.container, {
                palette: this.options.palette || [],
                localStorageKey: this.options.localStorageKey || '',
                maxPaletteSize: this.options.maxPaletteSize || 8,
                togglePaletteMoreText: this.options.togglePaletteMoreText || 'Custom',
                togglePaletteLessText: this.options.togglePaletteLessText || 'Collapse',
                togglePaletteOnly: this.options.togglePaletteOnly !== false,
                onSelect: (color) => this._onPaletteSelect(color),
                onToggleCustom: (showing) => this._toggleCustom(showing)
            });
        }

        this.customContainer = document.createElement('div');
        this.customContainer.className = 'lkcp-custom-outer';
        this.customContainer.style.display = 'none';
        this.container.appendChild(this.customContainer);

        if (this.el.tagName === 'INPUT' || this.el.tagName === 'TEXTAREA') {
            this.el.parentNode.insertBefore(this.container, this.el.nextSibling);
        } else {
            this.el.appendChild(this.container);
        }

        if (!this.showPaletteOnly) {
            this._ensureCustomView();
            this.customContainer.style.display = '';
        }
    }

    _renderDropdown() {
        this.container = document.createElement('div');
        this.container.className = 'lkcp-container lkcp-dropdown luckysheet-mousedown-cancel';
        this.container.style.display = 'none';

        if (this.options.showPaletteOnly) {
            this.paletteView = createPaletteView(this.container, {
                palette: this.options.palette || [],
                localStorageKey: this.options.localStorageKey || '',
                maxPaletteSize: this.options.maxPaletteSize || 8,
                togglePaletteMoreText: this.options.togglePaletteMoreText || 'Custom',
                togglePaletteLessText: this.options.togglePaletteLessText || 'Collapse',
                togglePaletteOnly: this.options.togglePaletteOnly !== false,
                onSelect: (color) => this._onPaletteSelect(color),
                onToggleCustom: (showing) => this._toggleCustom(showing)
            });
        }

        this.customContainer = document.createElement('div');
        this.customContainer.className = 'lkcp-custom-outer';
        this.customContainer.style.display = 'none';
        this.container.appendChild(this.customContainer);

        document.body.appendChild(this.container);

        this.el.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.container.style.display === 'none') {
                this._showDropdown();
            } else {
                this.container.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (this.container && !this.container.contains(e.target) && e.target !== this.el) {
                this.container.style.display = 'none';
            }
        });

        if (!this.options.showPaletteOnly) {
            this._ensureCustomView();
            this.customContainer.style.display = '';
        }
    }

    _showDropdown() {
        const rect = this.el.getBoundingClientRect();
        this.container.style.position = 'fixed';
        this.container.style.left = rect.left + 'px';
        this.container.style.top = (rect.bottom + 2) + 'px';
        this.container.style.display = '';
        this.container.style.zIndex = '9999994';
    }

    _onPaletteSelect(color) {
        this.currentColor = color;
        if (this.paletteView) this.paletteView.addRecent(color);
        this.customContainer.style.display = 'none';
        if (this.paletteView) {
            this.paletteView.show();
            this.paletteView.resetToggle();
        }
        if (this.options.change) {
            this.options.change(new Color(color));
        }
    }

    _toggleCustom(showing) {
        if (showing) {
            if (this.paletteView) this.paletteView.hide();
            this.customContainer.style.display = '';
            this._ensureCustomView();
            this.customView.setColor(this.currentColor);
        } else {
            this.customContainer.style.display = 'none';
            if (this.paletteView) this.paletteView.show();
        }
    }

    _ensureCustomView() {
        if (this.customView) return;
        this.customView = createCustomView(this.customContainer, {
            color: this.currentColor,
            showButtons: this.options.showButtons !== false,
            showInput: this.options.showInput !== false,
            showInitial: this.options.showInitial !== false,
            chooseText: this.options.chooseText || 'Choose',
            cancelText: this.options.cancelText || 'Cancel',
            onMove: (color) => {
                this.currentColor = color;
                if (this.options.move) this.options.move(new Color(color));
            },
            onChange: (color) => {
                this.currentColor = color;
                if (this.paletteView) this.paletteView.addRecent(color);
                if (this.options.change) this.options.change(new Color(color));
            },
            onCancel: () => {
                this.customContainer.style.display = 'none';
                if (this.paletteView) {
                    this.paletteView.show();
                    this.paletteView.resetToggle();
                }
            }
        });
    }

    get(format) {
        const color = new Color(this.currentColor);
        if (format === 'rgb') return color.toRgbString();
        return color.toHexString();
    }

    set(color) {
        this.currentColor = normalizeColor(color);
        if (this.customView) this.customView.setColor(this.currentColor);
    }

    resetView() {
        this.customContainer.style.display = 'none';
        if (this.paletteView) {
            this.paletteView.show();
            this.paletteView.resetToggle();
        }
    }

    show() {
        if (this.container) this.container.style.display = '';
    }

    hide() {
        if (this.container) this.container.style.display = 'none';
    }

    destroy() {
        if (this.destroyed) return;
        this.destroyed = true;
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        if (this.el && (this.el.tagName === 'INPUT' || this.el.tagName === 'TEXTAREA')) {
            this.el.style.display = '';
        }
        pickerInstances.delete(this.el);
    }
}
