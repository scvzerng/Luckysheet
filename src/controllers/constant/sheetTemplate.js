import locale from "../../locale/locale";
import { customSheetRightClickConfig } from "./configFunctions";

//底部 表格标签操作dom
function sheetconfigHTML() {
    const sheetconfig = locale().sheetconfig;

    const config = customSheetRightClickConfig();

    /* 如果配置项全部为flase，则隐藏入口且不再菜单项 */
    if (Object.values(config).every((ele) => !ele)) {
        $("#luckysheet-sheet-container-c").addClass("luckysheet-sheet-container-menu-hide");
        return "";
    }

    let hideTopMenuseparator = true;
    let moveTopMenuseparator = true;

    // 1. 当一个功能菜单块上方的功能块按钮都隐藏的时候，下方的功能块的顶部分割线也需要隐�?
    if (!config.delete && !config.copy && !config.rename && !config.color) {
        hideTopMenuseparator = false;
        if (!config.hide) {
            moveTopMenuseparator = false;
        }
    }

    // 2. 当一个功能菜单块内所有的按钮都隐藏的时候，它顶部的分割线也需要隐藏掉
    if (!config.hide) {
        hideTopMenuseparator = false;
    }
    if (!config.move) {
        moveTopMenuseparator = false;
    }

    const sheetconfigModel = `<div id="luckysheet-rightclick-sheet-menu" class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-mousedown-cancel"> 
                <div id="luckysheetsheetconfigdelete" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                    config.delete ? "block" : "none"
                };"> 
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                        sheetconfig.delete
                    }</div>
                </div> 
                <div id="luckysheetsheetconfigcopy" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                    config.copy ? "block" : "none"
                };"> 
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${sheetconfig.copy}</div> 
                </div> 
                <div id="luckysheetsheetconfigrename" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                    config.rename ? "block" : "none"
                };"> 
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                        sheetconfig.rename
                    }</div> 
                </div> 
                <div id="luckysheetsheetconfigcolor" class="luckysheet-cols-menuitem luckysheet-cols-submenu luckysheet-mousedown-cancel" style="display:${
                    config.color ? "block" : "none"
                };"> 
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel"> 
                        ${
                            sheetconfig.changeColor
                        } <span class="luckysheet-submenu-arrow iconfont-luckysheet luckysheet-iconfont-youjiantou" style="user-select: none;"></span> 
                    </div> 
                </div> 
                <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator" style="display:${
                    hideTopMenuseparator ? "block" : "none"
                };"></div> 
                <div id="luckysheetsheetconfighide" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                    config.hide ? "block" : "none"
                };"> 
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${sheetconfig.hide}</div> 
                </div> 
                <div id="luckysheetsheetconfigshow" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                    config.hide ? "block" : "none"
                };"> 
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                        sheetconfig.unhide
                    }</div> 
                </div> 
                <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator" style="display:${
                    moveTopMenuseparator ? "block" : "none"
                };"></div> 
                <div id="luckysheetsheetconfigmoveleft" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                    config.move ? "block" : "none"
                };"> 
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                        sheetconfig.moveLeft
                    }</div> 
                </div> 
                <div id="luckysheetsheetconfigmoveright" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="display:${
                    config.move ? "block" : "none"
                };"> 
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                        sheetconfig.moveRight
                    }</div> 
                </div> 
            </div> 
            <div id="luckysheetsheetconfigcolor_sub" class="luckysheet-cols-menu luckysheet-rightgclick-menu luckysheet-rightgclick-menu-sub luckysheet-mousedown-cancel">
                <div id="luckysheetsheetconfigcolorreset" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel">
                    <div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${
                        sheetconfig.resetColor
                    }</div>
                </div> 
                <div class="luckysheet-mousedown-cancel"> 
                    <div class="luckysheet-mousedown-cancel"> 
                        <input type="text" id="luckysheetsheetconfigcolorur" /> 
                    </div> 
                </div> 
            </div>`;

    return sheetconfigModel;
}

function filtermenuHTML() {
    const _locale = locale();
    const locale_filter = _locale.filter;

    return `<div class="luckysheet-cols-menu luckysheet-mousedown-cancel luckysheet-filter-menu" id="luckysheet-\${menuid}-menu"><div id="luckysheet-\${menuid}-orderby-asc" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.sortByAsc}</div></div><div id="luckysheet-\${menuid}-orderby-desc" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel"><div style="width:205px;" class="luckysheet-mousedown-cancel">${locale_filter.sortByDesc}</div></div></div> <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div><div id="luckysheet-\${menuid}-orderby-color" class="luckysheet-cols-menuitem luckysheet-cols-submenu luckysheet-mousedown-cancel"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel" style="position: relative;">${locale_filter.filterByColor}<span class="luckysheet-submenu-arrow iconfont-luckysheet luckysheet-iconfont-youjiantou" style="user-select: none;right: 0;"></span></div></div><div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div> <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" id="luckysheet-\${menuid}-bycondition" style="padding-top:0px;padding-bottom:0px;"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel"><i class="fa fa-caret-right" aria-hidden="true"></i> ${locale_filter.filterByCondition}</div></div> <div class="luckysheet-\${menuid}-bycondition" style="display:none;"><div class="luckysheet-flat-menu-button luckysheet-mousedown-cancel" id="luckysheet-\${menuid}-selected"><span class="luckysheet-mousedown-cancel" data-value="null" data-type="0">${locale_filter.filiterInputNone}</span><div class="luckysheet-mousedown-cancel"><i class="fa fa-sort" aria-hidden="true"></i></div></div><div class="luckysheet-\${menuid}-selected-input"><input type="text" placeholder="${locale_filter.filiterInputTip}" class="luckysheet-mousedown-cancel" /></div><div class="luckysheet-\${menuid}-selected-input luckysheet-\${menuid}-selected-input2"><span>${locale_filter.filiterRangeStart}</span><input type="text" placeholder="${locale_filter.filiterRangeStartTip}" class="luckysheet-mousedown-cancel" /><span>${locale_filter.filiterRangeEnd}</span><input type="text" placeholder="${locale_filter.filiterRangeEndTip}" class="luckysheet-mousedown-cancel" /></div></div> <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div> <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" id="luckysheet-\${menuid}-byvalue" style="padding-top:0px;padding-bottom:0px;"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel"><i class="fa fa-caret-right" aria-hidden="true"></i> ${locale_filter.filterByValues}</div></div> <div class="luckysheet-\${menuid}-byvalue"><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel luckysheet-mousedown-\${menuid}-byvalue-btn"><span id="luckysheet-\${menuid}-byvalue-btn-all" class="luckysheet-mousedown-cancel">${locale_filter.filterValueByAllBtn}</span> - <span id="luckysheet-\${menuid}-byvalue-btn-clear" class="luckysheet-mousedown-cancel">${locale_filter.filterValueByClearBtn}</span> - <span id="luckysheet-\${menuid}-byvalue-btn-contra" class="luckysheet-mousedown-cancel">${locale_filter.filterValueByInverseBtn}</span> <div><i class="fa fa-\${menuid} luckysheet-mousedown-cancel" aria-hidden="true"></i></div></div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" style="padding-left:3px; padding-right:3px;"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel"><input type="text" placeholder="${locale_filter.filterValueByTip}" class="luckysheet-mousedown-cancel" id="luckysheet-\${menuid}-byvalue-input" /><div class="luckysheet-\${menuid}-byvalue-input-icon luckysheet-mousedown-cancel"><i class="fa fa-search luckysheet-mousedown-cancel" aria-hidden="true"></i></div></div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel"><div id="luckysheet-\${menuid}-byvalue-select" class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel"></div></div></div> <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div> <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel"><div class="btn btn-primary luckysheet-mousedown-cancel" id="luckysheet-\${menuid}-confirm">${locale_filter.filterConform}</div> <div class="btn btn-default luckysheet-mousedown-cancel" id="luckysheet-\${menuid}-cancel">${locale_filter.filterCancel}</div> <div class="btn btn-danger luckysheet-mousedown-cancel" id="luckysheet-\${menuid}-initial">${locale_filter.clearFilter}</div></div></div> </div>`;
}

function filtersubmenuHTML() {
    const _locale = locale();
    const locale_filter = _locale.filter;

    return `<div style="z-index:1004;overflow-y:auto;" class="luckysheet-filter-submenu luckysheet-cols-menu luckysheet-mousedown-cancel" id="luckysheet-\${menuid}-submenu"><div data-value="null" data-type="0" class="luckysheet-cols-menuitem luckysheet-mousedown-cancel"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionNone}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="cellnull"  data-type="0"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellIsNull}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="cellnonull"  data-type="0"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellNotNull}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="textinclude"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellTextContain}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="textnotinclude"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellTextNotContain}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="textstart"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellTextStart}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="textend"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellTextEnd}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="textequal"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellTextEqual}</div></div>  <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div>  <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="dateequal"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellDateEqual}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="datelessthan"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellDateBefore}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="datemorethan"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellDateAfter}</div></div> <div class="luckysheet-menuseparator luckysheet-mousedown-cancel" role="separator"></div> <div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="morethan"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellGreater}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="moreequalthan"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellGreaterEqual}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="lessthan"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellLess}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="lessequalthan"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellLessEqual}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="equal"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellEqual}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="noequal"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellNotEqual}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="include"  data-type="2"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellBetween}</div></div><div class="luckysheet-cols-menuitem luckysheet-mousedown-cancel" data-value="noinclude" data-type="2"><div class="luckysheet-cols-menuitem-content luckysheet-mousedown-cancel">${locale_filter.conditionCellNotBetween}</div></div> </div>`;
}

function luckysheetAlternateformatHtml() {
    const _locale = locale();
    const alternatingColors = _locale.alternatingColors;
    const toolbar = _locale.toolbar;

    return (
        '<div id="luckysheet-modal-dialog-slider-alternateformat" class="luckysheet-modal-dialog-slider luckysheet-modal-dialog-slider-alternateformat" style="display: block;">' +
        '<div class="luckysheet-modal-dialog-slider-title">' +
        "<span>" +
        toolbar.alternatingColors +
        "</span>" +
        '<span class="luckysheet-model-close-btn" title="' +
        alternatingColors.close +
        '">' +
        '<i class="fa fa-times" aria-hidden="true"></i>' +
        "</span>" +
        "</div>" +
        '<div class="luckysheet-modal-dialog-slider-content">' +
        '<div class="textTitle">' +
        alternatingColors.applyRange +
        "</div>" +
        '<div id="luckysheet-alternateformat-range">' +
        '<input class="formulaInputFocus" placeholder="' +
        alternatingColors.selectRange +
        '"/>' +
        '<i class="fa fa-table" aria-hidden="true"></i>' +
        "</div>" +
        '<div id="luckysheet-alternateformat-checkbox">' +
        '<div class="cf">' +
        '<input type="checkbox" id="luckysheet-alternateformat-rowHeader"/>' +
        '<label for="luckysheet-alternateformat-rowHeader">' +
        alternatingColors.header +
        "</label>" +
        "</div>" +
        '<div class="cf">' +
        '<input type="checkbox" id="luckysheet-alternateformat-rowFooter"/>' +
        '<label for="luckysheet-alternateformat-rowFooter">' +
        alternatingColors.footer +
        "</label>" +
        "</div>" +
        "</div>" +
        '<div class="textTitle">' +
        alternatingColors.textTitle +
        "</div>" +
        '<div id="luckysheet-alternateformat-modelList" class="cf"></div>' +
        '<div class="textTitle">' +
        alternatingColors.custom +
        "</div>" +
        '<div id="luckysheet-alternateformat-modelCustom" class="cf"></div>' +
        '<div id="luckysheet-alternateformat-modelToning">' +
        '<div class="toningbox header">' +
        '<div class="toningShow"> ' +
        alternatingColors.header +
        " </div>" +
        '<div class="luckysheet-color-menu-button-indicator" title="' +
        alternatingColors.selectionTextColor +
        '" style="border-bottom-color: #000;margin-right: 10px;"> <div class="luckysheet-icon luckysheet-inline-block"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-text-color" style="user-select: none;"> </div> </div> </div>' +
        '<div class="luckysheet-color-menu-button-indicator" title="' +
        alternatingColors.selectionCellColor +
        '" style="border-bottom-color: #fff;"> <div class="luckysheet-icon luckysheet-inline-block"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-cell-color" style="user-select: none;"> </div> </div> </div>' +
        "</div>" +
        '<div class="toningbox ctOne">' +
        '<div class="toningShow"> ' +
        alternatingColors.colorShow +
        "1 </div>" +
        '<div class="luckysheet-color-menu-button-indicator" title="' +
        alternatingColors.selectionTextColor +
        '" style="border-bottom-color: #000;margin-right: 10px;"> <div class="luckysheet-icon luckysheet-inline-block"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-text-color" style="user-select: none;"> </div> </div> </div>' +
        '<div class="luckysheet-color-menu-button-indicator" title="' +
        alternatingColors.selectionCellColor +
        '" style="border-bottom-color: #fff;"> <div class="luckysheet-icon luckysheet-inline-block"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-cell-color" style="user-select: none;"> </div> </div> </div>' +
        "</div>" +
        '<div class="toningbox ctTwo">' +
        '<div class="toningShow"> ' +
        alternatingColors.colorShow +
        "2 </div>" +
        '<div class="luckysheet-color-menu-button-indicator" title="' +
        alternatingColors.selectionTextColor +
        '" style="border-bottom-color: #000;margin-right: 10px;"> <div class="luckysheet-icon luckysheet-inline-block"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-text-color" style="user-select: none;"> </div> </div> </div>' +
        '<div class="luckysheet-color-menu-button-indicator" title="' +
        alternatingColors.selectionCellColor +
        '" style="border-bottom-color: #fff;"> <div class="luckysheet-icon luckysheet-inline-block"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-cell-color" style="user-select: none;"> </div> </div> </div>' +
        "</div>" +
        '<div class="toningbox footer">' +
        '<div class="toningShow"> ' +
        alternatingColors.footer +
        " </div>" +
        '<div class="luckysheet-color-menu-button-indicator" title="' +
        alternatingColors.selectionTextColor +
        '" style="border-bottom-color: #000;margin-right: 10px;"> <div class="luckysheet-icon luckysheet-inline-block"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-text-color" style="user-select: none;"> </div> </div> </div>' +
        '<div class="luckysheet-color-menu-button-indicator" title="' +
        alternatingColors.selectionCellColor +
        '" style="border-bottom-color: #fff;"> <div class="luckysheet-icon luckysheet-inline-block"> <div aria-hidden="true" class="luckysheet-icon-img-container luckysheet-icon-img luckysheet-icon-cell-color" style="user-select: none;"> </div> </div> </div>' +
        "</div>" +
        "</div>" +
        '<button id="luckysheet-alternateformat-remove" class="btn btn-default" style="margin: 10px;">' +
        alternatingColors.removeColor +
        "</button>" +
        "</div>" +
        "</div>"
    );
}

export { sheetconfigHTML, filtermenuHTML, filtersubmenuHTML, luckysheetAlternateformatHtml };
