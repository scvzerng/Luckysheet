import Store from '../../store';
import richTextEditor from '../../ui/richTextEditor.js';

function showrightclickmenu($menu, x, y) {
    let winH = document.documentElement.clientHeight,
        winW = document.documentElement.clientWidth;
    let menuW = $menu.offsetWidth,
        menuH = $menu.offsetHeight;
    let top = y,
        left = x;

    if (x + menuW > winW) {
        left = x - menuW;
    }

    if (y + menuH > winH) {
        top = y - menuH;
    }

    if (top < 0) {
        top = 0;
    }

    Object.assign($menu.style, { top: top, left: left }); $menu.style.display = '';
}

function luckysheetactiveCell() {
    if (Store.fullscreenmode) {
        setTimeout(function() {
            // need preventScroll:true,fix Luckysheet has been set top, and clicking the cell will trigger the scrolling problem
            const input = richTextEditor.getNativeElement();
            input.focus({ preventScroll: true });
            richTextEditor.select();
            // document.getElementById("luckysheet-rich-text-editor").focus().select();
        }, 50);
    }
}

function luckysheetContainerFocus() {
    // document.getElementById(Store.container).focus({
    //     preventScroll: true
    // });

    // fix jquery error: Uncaught TypeError: ((n.event.special[g.origType] || {}).handle || g.handler).apply is not a function
    // document.getElementById(Store.container).setAttribute("tabindex", 0).focus();

    // need preventScroll:true,fix Luckysheet has been set top, and clicking the cell will trigger the scrolling problem fix #794 #152
    document.getElementById(Store.container)?.focus({ preventScroll: true });
}

function mouseclickposition($menu, x, y, p) {
    let winH = document.documentElement.clientHeight,
        winW = document.documentElement.clientWidth;
    let menuW = $menu.offsetWidth,
        menuH = $menu.offsetHeight;
    let top = y,
        left = x;

    if (p == null) {
        p = "lefttop";
    }

    if (p == "lefttop") {
        Object.assign($menu.style, { top: y, left: x }); $menu.style.display = '';
    } else if (p == "righttop") {
        Object.assign($menu.style, { top: y, left: x - menuW }); $menu.style.display = '';
    } else if (p == "leftbottom") {
        Object.assign($menu.style, { bottom: winH - y - 12, left: x }); $menu.style.display = '';
    } else if (p == "rightbottom") {
        Object.assign($menu.style, { bottom: winH - y - 12, left: x - menuW }); $menu.style.display = '';
    }
}

function $$(selector, context) {
    context = context || document;
    var elements = context.querySelectorAll(selector);
    return elements.length == 1 ? Array.prototype.slice.call(elements)[0] : Array.prototype.slice.call(elements);
}

export { showrightclickmenu, luckysheetactiveCell, luckysheetContainerFocus, mouseclickposition, $$ };
