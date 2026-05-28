import { isRealNum } from '../../global/validate';

function isJsonString(str) {
    try {
        if (typeof JSON.parse(str) == "object") {
            return true;
        }
    } catch (e) {}
    return false;
}

function replaceHtml(temp, dataarry) {
    return temp.replace(/\$\{([\w]+)\}/g, function(s1, s2) {
        let s = dataarry[s2];
        if (typeof s != "undefined") {
            return s;
        } else {
            return s1;
        }
    });
}

function getCharByteLength(char) {
    return Math.ceil(char.charCodeAt(0).toString(2).length / 8);
}

function getByteLen(val, subLen) {
    if (subLen === 0) {
        return "";
    }

    if (val == null) {
        return 0;
    }

    let len = 0;
    for (let i = 0; i < val.length; i++) {
        len += getCharByteLength(val.charAt(i));

        if (isRealNum(subLen) && len === ~~subLen) {
            return val.substring(0, i);
        }
    }

    return len;
}

function camel2split(camel) {
    return camel.replace(/([A-Z])/g, function(all, group) {
        return "-" + group.toLowerCase();
    });
}

export { isJsonString, replaceHtml, getByteLen, getCharByteLength, camel2split };
