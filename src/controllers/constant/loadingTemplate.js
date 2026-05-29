import locale from "../../locale/locale";
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import { createToolbarHtml } from "../toolbar";
import { v4 as uuidv4 } from 'uuid';

const luckysheetToolHTML =
    '<div id="luckysheet-tooltip-up" class="jfk-tooltip" role="tooltip" aria-hidden="true" style="left: 505px; top: 410px;"><div class="jfk-tooltip-contentId">组合图表</div><div class="jfk-tooltip-arrow jfk-tooltip-arrowup" style="left: 35.5px;"><div class="jfk-tooltip-arrowimplbefore"></div><div class="jfk-tooltip-arrowimplafter"></div></div></div>';

// toolbar
function menuToolBar() {
    return createToolbarHtml();
}

function customLoadingConfig() {
    const _locale = locale();
    const info = _locale.info;
    const config = {
        enable: true,
        image: () => {
            return `<svg viewBox="25 25 50 50" class="circular">
            <circle cx="50" cy="50" r="20" fill="none"></circle>
            </svg>`;
        },
        text: info.loading,
        viewBox: "32 32 64 64", // 只有为path时，才会使用
        imageClass: "",
        textClass: "",
        customClass: "",
    };
    if (JSON.stringify(luckysheetConfigsetting.loading) !== "{}") {
        Object.assign(config, luckysheetConfigsetting.loading);
    }
    return config;
}

const luckysheetloadingImage = function(config) {
    if (typeof config.image === "function") {
        return config.image();
    }
    const regE = new RegExp("^(image|path)://");
    const regResult = regE.exec(config.image);
    let imageHtml = "";
    if (regResult !== null) {
        const prefix = regResult[0];
        const type = regResult[1];
        const imageStr = regResult.input.substring(prefix.length);
        switch (type) {
            case "image":
                imageHtml = `<div class="image-type" style="background-image: url(${imageStr});"></div>`;
                break;
            case "path":
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.setAttribute("class", "path-type");
                svg.setAttribute("viewBox", config.viewBox);
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", imageStr);
                path.setAttribute("fill", "currentColor");
                svg.appendChild(path);
                imageHtml = svg.outerHTML;
                break;
            default:
                break;
        }
    }
    return imageHtml;
};

const luckysheetlodingHTML = function(target, coverConfig) {
    if (!target) {
        return;
    }
    const config = customLoadingConfig();
    if (coverConfig && JSON.stringify(coverConfig) !== "{}") {
        Object.assign(config, coverConfig);
    }
    if (typeof config.enable === "boolean" && config.enable === false) {
        return {
            el: "",
            show: show,
            close: close,
        };
    }
    const imageHtml = luckysheetloadingImage(config);
    const id = "luckysheet-loading-" + uuidv4();
    const loadingHtml = `
        <div class="luckysheet-loading-content"> 
            <div class="${config.imageClass} luckysheet-loading-image">
                ${imageHtml}
            </div>
            <div class="${config.textClass} luckysheet-loading-text">
            <span>${config.text}</span>
            </div>    
        </div>`;
    const loading = document.createElement("div");
    loading.id = id;
    loading.className = "luckysheet-loading-mask " + config.customClass;
    loading.innerHTML = loadingHtml;
    target.appendChild(loading);

    function show() {
        if (id) {
            const _elLoadShow2 = document.getElementById(id); if (_elLoadShow2) _elLoadShow2.style.display = '';
        }
    }

    function close() {
        if (id) {
            const _elLoadHide = document.getElementById(id); if (_elLoadHide) _elLoadHide.style.display = 'none';
        }
    }
    return {
        el: loading,
        show: show,
        close: close,
    };
};

export { luckysheetToolHTML, menuToolBar, luckysheetlodingHTML };
