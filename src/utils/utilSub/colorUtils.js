function parseRgbString(color) {
    let match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!match) return null;
    return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
}

function hexToRgb(hex) {
    let color = [],
        rgb = [];
    hex = hex.replace(/#/, "");

    if (hex.length == 3) {
        let tmp = [];

        for (let i = 0; i < 3; i++) {
            tmp.push(hex.charAt(i) + hex.charAt(i));
        }

        hex = tmp.join("");
    }

    for (let i = 0; i < 3; i++) {
        color[i] = "0x" + hex.substr(i + 2, 2);
        rgb.push(parseInt(Number(color[i])));
    }

    return "rgb(" + rgb.join(",") + ")";
}

function rgbTohex(color) {
    let parsed = parseRgbString(color);
    if (!parsed) return color;

    let r = parsed.r, g = parsed.g, b = parsed.b;
    let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    return hex;
}

export { hexToRgb, rgbTohex, parseRgbString };
