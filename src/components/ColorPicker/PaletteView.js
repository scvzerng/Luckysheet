import { normalizeColor, hexToHsv, hsvToHex, Color } from './colorUtils';

export function createPaletteView(container, options) {
    const palette = options.palette || [];
    const recentColors = loadRecent(options.localStorageKey, options.maxPaletteSize);
    const toggleMoreText = options.togglePaletteMoreText || 'Custom';
    const toggleLessText = options.togglePaletteLessText || 'Collapse';
    const togglePaletteOnly = options.togglePaletteOnly !== false;
    const onSelect = options.onSelect || function () {};
    const onToggleCustom = options.onToggleCustom || function () {};

    let showingCustom = false;

    const el = document.createElement('div');
    el.className = 'lkcp-palette-container luckysheet-mousedown-cancel';

    el.addEventListener('mousedown', function (e) {
        e.stopPropagation();
    });

    const paletteEl = document.createElement('div');
    paletteEl.className = 'lkcp-palette';

    palette.forEach(function (row) {
        const rowEl = document.createElement('div');
        rowEl.className = 'lkcp-palette-row';
        row.forEach(function (color) {
            const hex = normalizeColor(color);
            const swatch = document.createElement('div');
            swatch.className = 'lkcp-swatch luckysheet-mousedown-cancel';
            swatch.title = hex;
            swatch.style.backgroundColor = hex;
            swatch.setAttribute('data-color', hex);
            swatch.addEventListener('click', function (e) {
                e.stopPropagation();
                onSelect(hex);
            });
            rowEl.appendChild(swatch);
        });
        paletteEl.appendChild(rowEl);
    });

    const recentRow = document.createElement('div');
    recentRow.className = 'lkcp-palette-row lkcp-recent-row';
    renderRecent();
    paletteEl.appendChild(recentRow);

    el.appendChild(paletteEl);

    let toggleBtn = null;
    if (togglePaletteOnly) {
        toggleBtn = document.createElement('div');
        toggleBtn.className = 'lkcp-palette-toggle luckysheet-mousedown-cancel';
        toggleBtn.textContent = toggleMoreText;
        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            showingCustom = !showingCustom;
            toggleBtn.textContent = showingCustom ? toggleLessText : toggleMoreText;
            onToggleCustom(showingCustom);
        });
        el.appendChild(toggleBtn);
    }

    container.appendChild(el);

    function renderRecent() {
        recentRow.innerHTML = '';
        if (recentColors.length === 0) return;
        recentColors.forEach(function (color) {
            const swatch = document.createElement('div');
            swatch.className = 'lkcp-swatch luckysheet-mousedown-cancel';
            swatch.title = color;
            swatch.style.backgroundColor = color;
            swatch.setAttribute('data-color', color);
            swatch.addEventListener('click', function (e) {
                e.stopPropagation();
                onSelect(color);
            });
            recentRow.appendChild(swatch);
        });
    }

    function addRecent(color) {
        const hex = normalizeColor(color);
        const idx = recentColors.indexOf(hex);
        if (idx !== -1) recentColors.splice(idx, 1);
        recentColors.unshift(hex);
        const max = options.maxPaletteSize || 8;
        if (recentColors.length > max) recentColors.length = max;
        saveRecent(options.localStorageKey, recentColors);
        renderRecent();
    }

    function show() {
        el.style.display = '';
    }

    function hide() {
        el.style.display = 'none';
    }

    function resetToggle() {
        showingCustom = false;
        if (toggleBtn) toggleBtn.textContent = toggleMoreText;
    }

    return {
        addRecent: addRecent,
        show: show,
        hide: hide,
        resetToggle: resetToggle,
        el: el
    };
}

function loadRecent(key, max) {
    if (!key) return [];
    try {
        const data = localStorage.getItem(key);
        if (data) return JSON.parse(data).slice(0, max || 8);
    } catch (e) { /* ignore */ }
    return [];
}

function saveRecent(key, colors) {
    if (!key) return;
    try {
        localStorage.setItem(key, JSON.stringify(colors));
    } catch (e) { /* ignore */ }
}
