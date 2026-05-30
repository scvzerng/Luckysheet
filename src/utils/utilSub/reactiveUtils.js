import { getObjType } from './typeUtils.js';
import { showModalMask } from '../domUtils.js';

const createProxy = (data, k, callback) => {
    if (!data.hasOwnProperty(k)) {
        console.info("No %s in data", k);
        return;
    }

    if (getObjType(data) === "object") {
        if (getObjType(data[k]) === "object" || getObjType(data[k]) === "array") {
            defineObjectReactive(data, k, data[k], callback);
        } else {
            defineBasicReactive(data, k, data[k], callback);
        }
    }
};

function openSelfModel(id, isshowMask = true) {
    let _dialog = document.getElementById(id);
    if (!_dialog) return;
    const _content = _dialog.querySelector(".luckysheet-modal-dialog-content"); if (_content) _content.style.minWidth = '300px';
    let myh = _dialog.offsetHeight,
        myw = _dialog.offsetWidth;
    let winw = document.documentElement.clientWidth,
        winh = document.documentElement.clientHeight;
    let scrollLeft = document.documentElement.scrollLeft,
        scrollTop = document.documentElement.scrollTop;
    Object.assign(_dialog.style, {
        left: (winw + scrollLeft - myw) / 2 + "px",
        top: (winh + scrollTop - myh) / 3 + "px",
    });
    _dialog.style.display = 'block';

    if (isshowMask) {
        showModalMask();
    }
}

function defineObjectReactive(obj, key, value, callback) {
    // 递归
    obj[key] = new Proxy(value, {
        set(target, property, val, receiver) {
            setTimeout(() => {
                callback(target, property, val, receiver);
            }, 0);

            return Reflect.set(target, property, val, receiver);
        },
    });
}

function defineBasicReactive(obj, key, value, callback) {
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: false,
        get() {
            return value;
        },
        set(newValue) {
            if (value === newValue) return;
            console.log(`发现 ${key} 属性 ${value} -> ${newValue}`);

            setTimeout(() => {
                callback(value, newValue);
            }, 0);

            value = newValue;
        },
    });
}

export { openSelfModel, defineObjectReactive, defineBasicReactive, createProxy };
