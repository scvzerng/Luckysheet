import Store from '../store/index.js';

export function createDialog(options) {
    let modelHTML = `<div id="{{id}}" class="luckysheet-modal-dialog-slider {{addclass}}" style="display:none;">
        <div class="luckysheet-modal-dialog-slider-title">{{title}}</div>
        <div class="luckysheet-modal-dialog-slider-content">{{content}}</div>
        <div class="luckysheet-modal-dialog-slider-footer">{{botton}}</div>
    </div>`;

    let html = modelHTML;
    for (let key in options) {
        html = html.replace(new RegExp("\\{\\{" + key + "\\}\\}", "g"), options[key]);
    }

    document.body.insertAdjacentHTML('beforeend', html);
    return $("#" + options.id);
}

export function createToolbarMenu(menu, submenu) {
    if (submenu) {
        document.body.insertAdjacentHTML('beforeend', menu + submenu);
    } else {
        document.body.insertAdjacentHTML('beforeend', menu);
    }
}
