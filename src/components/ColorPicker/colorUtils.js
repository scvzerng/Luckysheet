export function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const num = parseInt(hex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

export function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (v) {
        const h = Math.max(0, Math.min(255, Math.round(v))).toString(16);
        return h.length === 1 ? '0' + h : h;
    }).join('');
}

export function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h, s = max === 0 ? 0 : d / max, v = max;
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
}

export function hsvToRgb(h, s, v) {
    h /= 360; s /= 100; v /= 100;
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

export function hexToHsv(hex) {
    const rgb = hexToRgb(hex);
    return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

export function hsvToHex(h, s, v) {
    const rgb = hsvToRgb(h, s, v);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export function normalizeColor(color) {
    if (!color) return '#000000';
    if (color.charAt(0) === '#') return color;
    const m = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (m) return rgbToHex(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
    return '#000000';
}

export class Color {
    constructor(hex) {
        this.hex = normalizeColor(hex);
    }
    toHexString() {
        return this.hex;
    }
    toRgbString() {
        const c = hexToRgb(this.hex);
        return 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')';
    }
}

export const STANDARD_PALETTE = [
    ['#000', '#444', '#666', '#999', '#ccc', '#eee', '#f3f3f3', '#fff'],
    ['#f00', '#f90', '#ff0', '#0f0', '#0ff', '#00f', '#90f', '#f0f'],
    ['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc'],
    ['#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
    ['#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0'],
    ['#c00', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79'],
    ['#900', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47'],
    ['#600', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130']
];

export const SHEET_TAB_PALETTE = [
    ['rgb(0,0,0)', 'rgb(67,67,67)', 'rgb(102,102,102)', 'rgb(204,204,204)', 'rgb(217,217,217)', 'rgb(255,255,255)'],
    ['rgb(152,0,0)', 'rgb(255,0,0)', 'rgb(255,153,0)', 'rgb(255,255,0)', 'rgb(0,255,0)', 'rgb(0,255,255)', 'rgb(74,134,232)', 'rgb(0,0,255)', 'rgb(153,0,255)', 'rgb(255,0,255)'],
    ['rgb(230,184,175)', 'rgb(244,204,204)', 'rgb(252,229,205)', 'rgb(255,242,204)', 'rgb(217,234,211)', 'rgb(208,224,227)', 'rgb(201,218,248)', 'rgb(207,226,243)', 'rgb(217,210,233)', 'rgb(234,209,220)'],
    ['rgb(221,126,107)', 'rgb(234,153,153)', 'rgb(249,203,156)', 'rgb(255,229,153)', 'rgb(182,215,168)', 'rgb(162,196,201)', 'rgb(164,194,244)', 'rgb(159,197,232)', 'rgb(180,167,214)', 'rgb(213,166,189)'],
    ['rgb(204,65,37)', 'rgb(224,102,102)', 'rgb(246,178,107)', 'rgb(255,217,102)', 'rgb(147,196,125)', 'rgb(118,165,175)', 'rgb(109,158,235)', 'rgb(111,168,220)', 'rgb(142,124,195)', 'rgb(194,123,160)'],
    ['rgb(166,28,0)', 'rgb(204,0,0)', 'rgb(230,145,56)', 'rgb(241,194,50)', 'rgb(106,168,79)', 'rgb(69,129,142)', 'rgb(60,120,216)', 'rgb(61,133,198)', 'rgb(103,78,167)', 'rgb(166,77,121)'],
    ['rgb(91,15,0)', 'rgb(102,0,0)', 'rgb(120,63,4)', 'rgb(127,96,0)', 'rgb(39,78,19)', 'rgb(12,52,61)', 'rgb(28,69,135)', 'rgb(7,55,99)', 'rgb(32,18,77)', 'rgb(76,17,48)'],
    ['#c1232b', '#27727b', '#fcce10', '#e87c25', '#b5c334', '#fe8463', '#9bca63', '#fad860', '#f3a43b', '#60c0dd', '#d7504b', '#c6e579', '#f4e001', '#f0805a', '#26c0c0', '#c12e34', '#e6b600', '#0098d9', '#2b821d', '#005eaa', '#339ca8', '#cda819', '#32a487', '#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8']
];
