import { getObjType } from './typeUtils.js';

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
    let $t = $("#" + id)
            .find(".luckysheet-modal-dialog-content")
            .css("min-width", 300)
            .end(),
        myh = $t.outerHeight(),
        myw = $t.outerWidth();
    let winw = $(window).width(),
        winh = $(window).height();
    let scrollLeft = $(document).scrollLeft(),
        scrollTop = $(document).scrollTop();
    $t.css({
        left: (winw + scrollLeft - myw) / 2,
        top: (winh + scrollTop - myh) / 3,
    }).show();

    if (isshowMask) {
        $("#luckysheet-modal-dialog-mask").show();
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
