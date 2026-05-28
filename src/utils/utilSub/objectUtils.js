export function deepClone(obj) {
    if (obj == null || typeof obj !== 'object') {
        return obj;
    }
    return JSON.parse(JSON.stringify(obj));
}

export function roundPrecision(val, digits) {
    if (digits == null) {
        digits = 9;
    }
    let factor = Math.pow(10, digits);
    return Math.round(val * factor) / factor;
}

export function isInfinite(val) {
    return val == Infinity || val == -Infinity;
}

export function formatNumericCell(cell, genarate) {
    if (cell.v == null) {
        return cell;
    }
    if (isInfinite(cell.v)) {
        cell.m = cell.v.toString();
        return cell;
    }
    if (cell.v.toString().indexOf("e") > -1) {
        let len = cell.v.toString().split(".")[1].split("e")[0].length;
        if (len > 5) {
            len = 5;
        }
        cell.m = cell.v.toExponential(len).toString();
    } else {
        let mask = genarate(roundPrecision(cell.v));
        cell.m = mask[0].toString();
    }
    return cell;
}
