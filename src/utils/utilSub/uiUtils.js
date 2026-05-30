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

    Object.assign($menu.style, { top: top + "px", left: left + "px" }); $menu.style.display = 'block';
}

function luckysheetactiveCell() {
    if (Store.fullscreenmode) {
        setTimeout(function() {
            const input = richTextEditor.getNativeElement();
            input.focus({ preventScroll: true });
            richTextEditor.select();
        }, 50);
    }
}

function luckysheetContainerFocus() {
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
        Object.assign($menu.style, { top: y + "px", left: x + "px" }); $menu.style.display = 'block';
    } else if (p == "righttop") {
        Object.assign($menu.style, { top: y + "px", left: x - menuW + "px" }); $menu.style.display = 'block';
    } else if (p == "leftbottom") {
        Object.assign($menu.style, { bottom: winH - y - 12 + "px", left: x + "px" }); $menu.style.display = 'block';
    } else if (p == "rightbottom") {
        Object.assign($menu.style, { bottom: winH - y - 12 + "px", left: x - menuW + "px" }); $menu.style.display = 'block';
    }
}

function $$(selector, context) {
    context = context || document;
    var elements = context.querySelectorAll(selector);
    return elements.length == 1 ? Array.prototype.slice.call(elements)[0] : Array.prototype.slice.call(elements);
}

export { showrightclickmenu, luckysheetactiveCell, luckysheetContainerFocus, mouseclickposition, $$ };
