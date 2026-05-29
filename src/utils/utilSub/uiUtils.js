import Store from '../../store';
import richTextEditor from '../../ui/richTextEditor.js';

function showrightclickmenu($menu, x, y) {
    let winH = document.documentElement.clientHeight,
        winW = document.documentElement.clientWidth;
    let menuW = $menu.width(),
        menuH = $menu.height();
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

    $menu.css({ top: top, left: left }).show();
}

function luckysheetactiveCell() {
    if (Store.fullscreenmode) {
        setTimeout(function() {
            // need preventScroll:true,fix Luckysheet has been set top, and clicking the cell will trigger the scrolling problem
            const input = richTextEditor.getNativeElement();
            input.focus({ preventScroll: true });
            richTextEditor.select();
            // $("#luckysheet-rich-text-editor").focus().select();
        }, 50);
    }
}

function luckysheetContainerFocus() {
    // $("#" + Store.container).focus({
    //     preventScroll: true
    // });

    // fix jquery error: Uncaught TypeError: ((n.event.special[g.origType] || {}).handle || g.handler).apply is not a function
    // $("#" + Store.container).attr("tabindex", 0).focus();

    // need preventScroll:true,fix Luckysheet has been set top, and clicking the cell will trigger the scrolling problem fix #794 #152
    document.getElementById(Store.container).focus({ preventScroll: true });
}

function mouseclickposition($menu, x, y, p) {
    let winH = document.documentElement.clientHeight,
        winW = document.documentElement.clientWidth;
    let menuW = $menu.width(),
        menuH = $menu.height();
    let top = y,
        left = x;

    if (p == null) {
        p = "lefttop";
    }

    if (p == "lefttop") {
        $menu.css({ top: y, left: x }).show();
    } else if (p == "righttop") {
        $menu.css({ top: y, left: x - menuW }).show();
    } else if (p == "leftbottom") {
        $menu.css({ bottom: winH - y - 12, left: x }).show();
    } else if (p == "rightbottom") {
        $menu.css({ bottom: winH - y - 12, left: x - menuW }).show();
    }
}

function $$(selector, context) {
    context = context || document;
    var elements = context.querySelectorAll(selector);
    return elements.length == 1 ? Array.prototype.slice.call(elements)[0] : Array.prototype.slice.call(elements);
}

export { showrightclickmenu, luckysheetactiveCell, luckysheetContainerFocus, mouseclickposition, $$ };
