

function hexToRgb(hex) {
    let color = [],
        rgb = [];
    hex = hex.replace(/#/, "");

    if (hex.length == 3) {
        // 处理 "#abc" 成 "#aabbcc"
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
    let rgb;

    if (color.indexOf("rgba") > -1) {
        rgb = color
            .replace("rgba(", "")
            .replace(")", "")
            .split(",");
    } else {
        rgb = color
            .replace("rgb(", "")
            .replace(")", "")
            .split(",");
    }

    let r = parseInt(rgb[0]);
    let g = parseInt(rgb[1]);
    let b = parseInt(rgb[2]);

    let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    return hex;
}

export { hexToRgb, rgbTohex };
