import Store from '../store/index.js';
import inputBox from '../ui/inputBox.js';
import cellMain from '../ui/cellMain.js';
import formulaDialogs from '../ui/formulaDialogs.js';

export function getScrollPosition() {
    let cellMain = $("#luckysheet-cell-main");
    return {
        scrollTop: cellMain.scrollTop(),
        scrollLeft: cellMain.scrollLeft()
    };
}

export function getCellMainSize() {
    let el = cellMain.el;
    return {
        winH: el.height(),
        winW: el.width()
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
    return parseInt(inputBox.getCss("top")) > 0;
}

export function resetInputBoxStyle() {
    inputBox.resetStyle();
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
    return formulaDialogs.singleRange.isVisible() || formulaDialogs.multiRange.isVisible();
}

export function checkMenuOverflow(tlen, userlen, menuleft) {
    return tlen > userlen && tlen + menuleft > $("#" + Store.container).width();
}

export function createSelectionSetDiv(index) {
    cellMain.append('<div id="luckysheet-datavisual-selection-set-' + index + '" class="luckysheet-datavisual-selection-set"></div>');
}

export function getWindowSize() {
    return {
        winW: $(window).width(),
        winH: $(window).height()
    };
}
