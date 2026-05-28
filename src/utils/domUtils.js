import Store from '../store/index.js';

export function getScrollPosition() {
    let cellMain = $("#luckysheet-cell-main");
    return {
        scrollTop: cellMain.scrollTop(),
        scrollLeft: cellMain.scrollLeft()
    };
}

export function getCellMainSize() {
    let cellMain = $("#luckysheet-cell-main");
    return {
        winH: cellMain.height(),
        winW: cellMain.width()
    };
}

export function getScrollAndSize() {
    let cellMain = $("#luckysheet-cell-main");
    return {
        scrollTop: cellMain.scrollTop(),
        scrollLeft: cellMain.scrollLeft(),
        winH: cellMain.height(),
        winW: cellMain.width()
    };
}

export function getMousePositionWithScroll(mouse) {
    let scroll = getScrollPosition();
    return {
        x: mouse[0] + scroll.scrollLeft,
        y: mouse[1] + scroll.scrollTop
    };
}

export function isInputBoxActive() {
    return parseInt($("#luckysheet-input-box").css("top")) > 0;
}

export function resetInputBoxStyle() {
    $("#luckysheet-input-box").removeAttr("style");
}

export function showModalMask() {
    $("#luckysheet-modal-dialog-mask").show();
}

export function hideModalMask() {
    $("#luckysheet-modal-dialog-mask").hide();
}

export function isModalMaskVisible() {
    return $("#luckysheet-modal-dialog-mask").is(":visible");
}

export function isImageEditing() {
    return $("#luckysheet-modal-dialog-activeImage").is(":visible") || $("#luckysheet-modal-dialog-cropping").is(":visible");
}

export function isFormulaDialogVisible() {
    return $("#luckysheet-singleRange-dialog").is(":visible") || $("#luckysheet-multiRange-dialog").is(":visible");
}

export function checkMenuOverflow(tlen, userlen, menuleft) {
    return tlen > userlen && tlen + menuleft > $("#" + Store.container).width();
}

export function createSelectionSetDiv(index) {
    $("#luckysheet-cell-main").append('<div id="luckysheet-datavisual-selection-set-' + index + '" class="luckysheet-datavisual-selection-set"></div>');
}

export function getWindowSize() {
    return {
        winW: $(window).width(),
        winH: $(window).height()
    };
}
