import mobileinit from "../mobile";
import {
    selectHightlightShow,
    selectIsOverlap,
    selectionCopyShow,
    luckysheet_count_show,
    selectHelpboxFill,
} from "../select";

import {
    replaceHtml,
    getObjType,
    chatatABC,
    ArrayUnique,
    showrightclickmenu,
    luckysheetactiveCell,
    luckysheetContainerFocus,
    $$,
} from "../../utils/util";
import browser from "../../global/browser";

export default function init() {
    const os = browser.detectOS(),
        isMobile = browser.mobilecheck();

    //移动端
    if (isMobile) {
        mobileinit();
    }
    if (!Date.now)
        Date.now = function() {
            return new Date().getTime();
        };
    //requestAnimationFrame method
    (function() {
        "use strict";

        var vendors = ["webkit", "moz"];
        for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
            var vp = vendors[i];
            window.requestAnimationFrame = window[vp + "RequestAnimationFrame"];
            window.cancelAnimationFrame =
                window[vp + "CancelAnimationFrame"] || window[vp + "CancelRequestAnimationFrame"];
        }
        if (
            /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || // iOS6 is buggy
            !window.requestAnimationFrame ||
            !window.cancelAnimationFrame
        ) {
            var lastTime = 0;
            window.requestAnimationFrame = function(callback) {
                var now = Date.now();
                var nextTime = Math.max(lastTime + 16, now);
                return setTimeout(function() {
                    callback((lastTime = nextTime));
                }, nextTime - now);
            };
            window.cancelAnimationFrame = clearTimeout;
        }
    })();
}
