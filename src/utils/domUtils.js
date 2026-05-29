import Store from '../store/index.js';
import inputBox from '../ui/inputBox.js';
import cellMain from '../ui/cellMain.js';
import formulaDialogs from '../ui/formulaDialogs.js';
import imageDialog from '../ui/imageDialog.js';

export function getScrollPosition() {
    let el = cellMain.el;
    return {
        scrollTop: el.scrollTop(),
        scrollLeft: el.scrollLeft()
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
    let el = cellMain.el;
    return {
        scrollTop: el.scrollTop(),
        scrollLeft: el.scrollLeft(),
        winH: el.height(),
        winW: el.width()
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
    return inputBox.getTop() > 0;
}

export function getInputBoxTop() {
    return inputBox.getTop();
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
    return imageDialog.active.isVisible() || imageDialog.cropping.isVisible();
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
        winW: document.documentElement.clientWidth,
        winH: document.documentElement.clientHeight
    };
}
