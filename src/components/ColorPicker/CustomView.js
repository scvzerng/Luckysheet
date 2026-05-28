import { normalizeColor, hexToHsv, hsvToHex, hexToRgb, Color } from './colorUtils';

export function createCustomView(container, options) {
    const onMove = options.onMove || function () {};
    const onChange = options.onChange || function () {};
    const onCancel = options.onCancel || function () {};
    const showButtons = options.showButtons !== false;
    const showInput = options.showInput !== false;
    const showInitial = options.showInitial !== false;
    const chooseText = options.chooseText || 'Choose';
    const cancelText = options.cancelText || 'Cancel';

    let currentHex = normalizeColor(options.color || '#000000');
    let hsv = hexToHsv(currentHex);
    let draggingSV = false;
    let draggingHue = false;

    const el = document.createElement('div');
    el.className = 'lkcp-custom-container luckysheet-mousedown-cancel';

    el.addEventListener('mousedown', function (e) {
        e.stopPropagation();
    });

    const topEl = document.createElement('div');
    topEl.className = 'lkcp-custom-top';

    const svWrap = document.createElement('div');
    svWrap.className = 'lkcp-sv-wrap luckysheet-mousedown-cancel';
    const svCanvas = document.createElement('canvas');
    svCanvas.className = 'lkcp-sv-canvas luckysheet-mousedown-cancel';
    svCanvas.width = 150;
    svCanvas.height = 150;
    const svDragger = document.createElement('div');
    svDragger.className = 'lkcp-sv-dragger luckysheet-mousedown-cancel';
    svWrap.appendChild(svCanvas);
    svWrap.appendChild(svDragger);
    topEl.appendChild(svWrap);

    const hueWrap = document.createElement('div');
    hueWrap.className = 'lkcp-hue-wrap luckysheet-mousedown-cancel';
    const hueCanvas = document.createElement('canvas');
    hueCanvas.className = 'lkcp-hue-canvas luckysheet-mousedown-cancel';
    hueCanvas.width = 20;
    hueCanvas.height = 150;
    const hueSlider = document.createElement('div');
    hueSlider.className = 'lkcp-hue-slider luckysheet-mousedown-cancel';
    hueWrap.appendChild(hueCanvas);
    hueWrap.appendChild(hueSlider);
    topEl.appendChild(hueWrap);

    el.appendChild(topEl);

    let inputEl = null;
    if (showInput) {
        const inputWrap = document.createElement('div');
        inputWrap.className = 'lkcp-input-wrap';
        inputEl = document.createElement('input');
        inputEl.className = 'lkcp-input luckysheet-mousedown-cancel';
        inputEl.type = 'text';
        inputEl.value = currentHex;
        inputEl.addEventListener('mousedown', function (e) {
            e.stopPropagation();
        });
        inputEl.addEventListener('change', function () {
            const val = normalizeColor(inputEl.value);
            currentHex = val;
            hsv = hexToHsv(val);
            updateUI();
            onChange(currentHex);
        });
        inputWrap.appendChild(inputEl);
        el.appendChild(inputWrap);
    }

    if (showInitial) {
        const initialWrap = document.createElement('div');
        initialWrap.className = 'lkcp-initial-wrap';
        const initialSwatch = document.createElement('div');
        initialSwatch.className = 'lkcp-initial-swatch';
        initialSwatch.style.backgroundColor = currentHex;
        const currentSwatch = document.createElement('div');
        currentSwatch.className = 'lkcp-current-swatch';
        currentSwatch.style.backgroundColor = currentHex;
        initialWrap.appendChild(initialSwatch);
        initialWrap.appendChild(currentSwatch);
        el.appendChild(initialWrap);
        options._initialSwatch = initialSwatch;
        options._currentSwatch = currentSwatch;
    }

    if (showButtons) {
        const btnWrap = document.createElement('div');
        btnWrap.className = 'lkcp-btn-wrap';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'lkcp-btn lkcp-btn-cancel luckysheet-mousedown-cancel';
        cancelBtn.textContent = cancelText;
        cancelBtn.addEventListener('mousedown', function (e) {
            e.stopPropagation();
        });
        cancelBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            onCancel();
        });
        const chooseBtn = document.createElement('button');
        chooseBtn.className = 'lkcp-btn lkcp-btn-choose luckysheet-mousedown-cancel';
        chooseBtn.textContent = chooseText;
        chooseBtn.addEventListener('mousedown', function (e) {
            e.stopPropagation();
        });
        chooseBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            onChange(currentHex);
        });
        btnWrap.appendChild(cancelBtn);
        btnWrap.appendChild(chooseBtn);
        el.appendChild(btnWrap);
    }

    container.appendChild(el);

    drawSV();
    drawHue();
    updateDraggerPos();
    updateHueSliderPos();

    function drawSV() {
        const ctx = svCanvas.getContext('2d');
        const w = svCanvas.width;
        const h = svCanvas.height;
        const hueColor = hsvToHex(hsv.h, 100, 100);
        ctx.fillStyle = hueColor;
        ctx.fillRect(0, 0, w, h);
        const gradWhite = ctx.createLinearGradient(0, 0, w, 0);
        gradWhite.addColorStop(0, '#ffffff');
        gradWhite.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradWhite;
        ctx.fillRect(0, 0, w, h);
        const gradBlack = ctx.createLinearGradient(0, 0, 0, h);
        gradBlack.addColorStop(0, 'rgba(0,0,0,0)');
        gradBlack.addColorStop(1, '#000000');
        ctx.fillStyle = gradBlack;
        ctx.fillRect(0, 0, w, h);
    }

    function drawHue() {
        const ctx = hueCanvas.getContext('2d');
        const w = hueCanvas.width;
        const h = hueCanvas.height;
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        for (let i = 0; i <= 360; i += 60) {
            grad.addColorStop(i / 360, hsvToHex(i, 100, 100));
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    function updateDraggerPos() {
        const w = svCanvas.width;
        const h = svCanvas.height;
        const x = (hsv.s / 100) * w;
        const y = (1 - hsv.v / 100) * h;
        svDragger.style.left = (x - 5) + 'px';
        svDragger.style.top = (y - 5) + 'px';
    }

    function updateHueSliderPos() {
        const h = hueCanvas.height;
        const y = (hsv.h / 360) * h;
        hueSlider.style.top = (y - 3) + 'px';
    }

    function updateUI() {
        drawSV();
        updateDraggerPos();
        updateHueSliderPos();
        if (inputEl) inputEl.value = currentHex;
        if (options._currentSwatch) options._currentSwatch.style.backgroundColor = currentHex;
    }

    function setColor(hex) {
        currentHex = normalizeColor(hex);
        hsv = hexToHsv(currentHex);
        updateUI();
    }

    function handleSV(e) {
        const rect = svCanvas.getBoundingClientRect();
        let x = (e.clientX || e.touches[0].clientX) - rect.left;
        let y = (e.clientY || e.touches[0].clientY) - rect.top;
        x = Math.max(0, Math.min(rect.width, x));
        y = Math.max(0, Math.min(rect.height, y));
        hsv.s = (x / rect.width) * 100;
        hsv.v = (1 - y / rect.height) * 100;
        currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);
        updateUI();
        onMove(currentHex);
    }

    function handleHue(e) {
        const rect = hueCanvas.getBoundingClientRect();
        let y = (e.clientY || e.touches[0].clientY) - rect.top;
        y = Math.max(0, Math.min(rect.height, y));
        hsv.h = (y / rect.height) * 360;
        if (hsv.s === 0 && hsv.v === 0) {
            hsv.s = 100;
            hsv.v = 100;
        }
        currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);
        updateUI();
        onMove(currentHex);
    }

    svWrap.addEventListener('mousedown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        draggingSV = true;
        handleSV(e);
    });
    hueWrap.addEventListener('mousedown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        draggingHue = true;
        handleHue(e);
    });
    svWrap.addEventListener('touchstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
        draggingSV = true;
        handleSV(e);
    }, { passive: false });
    hueWrap.addEventListener('touchstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
        draggingHue = true;
        handleHue(e);
    }, { passive: false });

    document.addEventListener('mousemove', function (e) {
        if (draggingSV) handleSV(e);
        if (draggingHue) handleHue(e);
    });
    document.addEventListener('touchmove', function (e) {
        if (draggingSV) handleSV(e);
        if (draggingHue) handleHue(e);
    });
    document.addEventListener('mouseup', function () {
        if (draggingSV || draggingHue) {
            if (!showButtons) {
                onChange(currentHex);
            }
        }
        draggingSV = false;
        draggingHue = false;
    });
    document.addEventListener('touchend', function () {
        if (draggingSV || draggingHue) {
            if (!showButtons) {
                onChange(currentHex);
            }
        }
        draggingSV = false;
        draggingHue = false;
    });

    return {
        setColor: setColor,
        getColor: function () { return currentHex; },
        destroy: function () {
            el.remove();
        }
    };
}
