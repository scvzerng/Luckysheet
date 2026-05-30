import luckysheetConfigsetting from './luckysheetConfigsetting';
import luckysheetFreezen from './freezen';
import { luckysheetrefreshgrid } from '../global/refresh';
import Store from '../store';
import locale from '../locale/locale';
import sheetmanage from './sheetmanage';
import tooltip from '../global/tooltip'
import { $$, getObjType, camel2split } from "../utils/util";
import { getHeaderTotalHeight } from "../utils/storeAccess.js";
import { getScrollPosition } from '../utils/domUtils.js';
import { defaultToolbar, toolbarIdMap } from './toolbar';
import scrollBarX from '../ui/scrollBarX.js';
import scrollBarY from '../ui/scrollBarY.js';
import { rowHeader } from '../ui/rowColHeader.js';
import gridWindow from '../ui/gridWindow.js';
import cellMain from '../ui/cellMain.js';
import { colHeader } from '../ui/rowColHeader.js';
import canvasContext from '../ui/canvasContext.js';

let gridW = 0,
    gridH = 0;

export default function luckysheetsizeauto(isRefreshCanvas=true) {
    if (!luckysheetConfigsetting.showinfobar) {
        Store.infobarHeight = 0;
        document.getElementById("luckysheet_info_detail").style.display = 'none';
    }
    else {
        document.getElementById("luckysheet_info_detail").style.display = '';
        // Store.infobarHeight = 56;
        Store.infobarHeight = document.querySelector('#luckysheet_info_detail').offsetHeight;
    }

    if (!!Store.toobarObject && !!Store.toobarObject.toobarElements && Store.toobarObject.toobarElements === null) {
        document.getElementById(Store.container).querySelector(".luckysheet-wa-editor").style.display = 'none';
        Store.toolbarHeight = 0;
    }
    else {
        document.getElementById(Store.container).querySelector(".luckysheet-wa-editor").style.display = '';
        // Store.toolbarHeight = 72;
        Store.toolbarHeight = document.querySelector('#' + Store.container +' .luckysheet-wa-editor').offsetHeight;
    }

    // if (!luckysheetConfigsetting.showsheetbar) {
    //     document.getElementById(Store.container).querySelector("#luckysheet-sheet-area").style.display = 'none';
    //     Store.sheetBarHeight = 0;
    // }
    // else {
    //     document.getElementById(Store.container).querySelector("#luckysheet-sheet-area").style.display = '';
    //     Store.sheetBarHeight = 31;
    // }


    customSheetbarConfig();

    // if (!luckysheetConfigsetting.showstatisticBar) {
    //     document.getElementById(Store.container).querySelector(".luckysheet-stat-area").style.display = 'none';
    //     Store.statisticBarHeight = 0;
    // }
    // else {
    //     document.getElementById(Store.container).querySelector(".luckysheet-stat-area").style.display = '';
    //     Store.statisticBarHeight = 23;
    // }

    customStatisticBarConfig();

    // 公式栏
    const formulaEle = document.querySelector("#" + Store.container + ' .luckysheet-wa-calculate');
    if (!luckysheetConfigsetting.sheetFormulaBar) {
        formulaEle.style.display = 'none';
        Store.calculatebarHeight = 0;
    }
    else {
        formulaEle.style.display = 'block';
        Store.calculatebarHeight = formulaEle.offsetHeight;
    }

    document.getElementById(Store.container).querySelector(".luckysheet-grid-container").style.top = Store.toolbarHeight + Store.infobarHeight + Store.calculatebarHeight;

    gridW = document.getElementById(Store.container).offsetWidth;

    if(luckysheetConfigsetting.showConfigWindowResize){
        const _altSlider = document.getElementById("luckysheet-modal-dialog-slider-alternateformat");
        if(_altSlider && _altSlider.offsetWidth > 0){
            gridW -= _altSlider.offsetWidth;
        }
    }

    const _locale = locale();
    const locale_toolbar = _locale.toolbar;
    let ismore = false,
        toolbarW = 0,
        morebtn = `<div class="luckysheet-toolbar-button luckysheet-inline-block" data-tips="${locale_toolbar.toolMoreTip}" id="luckysheet-icon-morebtn" role="button" style="user-select: none;">
            <div class="luckysheet-toolbar-button-outer-box luckysheet-inline-block" style="user-select: none;">
                <div class="luckysheet-toolbar-button-inner-box luckysheet-inline-block" style="user-select: none;">

                    <div class="luckysheet-toolbar-menu-button-caption luckysheet-inline-block" style="user-select: none;">
                        ${locale_toolbar.toolMore}
                    </div>
                    <div class="luckysheet-toolbar-menu-button-dropdown luckysheet-inline-block iconfont-luckysheet luckysheet-iconfont-xiayige" style="user-select: none;font-size:12px;">
                    </div>

                </div>
            </div>
         </div>`;
    const _luckyOffset = (() => { const _r = document.getElementById(Store.container).getBoundingClientRect(); return {top: _r.top + window.pageYOffset, left: _r.left + window.pageXOffset}; })();
    let morediv = '<div id="luckysheet-icon-morebtn-div" class="luckysheet-wa-editor" style="position:absolute;top:'+ (Store.infobarHeight + Store.toolbarHeight + _luckyOffset.top + document.body.scrollTop) +'px;right:0px;z-index:1003;padding:5.5px;visibility:hidden;height:auto;white-space:initial;"></div>';

    if(document.getElementById("luckysheet-icon-morebtn-div") === null){
        document.body.insertAdjacentHTML('beforeend', morediv);
    }

    document.getElementById("luckysheet-icon-morebtn-div").style.visibility = 'hidden';

    document.querySelectorAll("#luckysheet-icon-morebtn-div > div").forEach(function(el) {
        const _container = document.getElementById("luckysheet-wa-editor");

        _container.appendChild(document.createTextNode(" "));

        _container.appendChild(el);
    });

    document.getElementById("luckysheet-icon-morebtn")?.remove();

    // 所有按钮宽度与元素定位
    const toobarWidths = Store.toobarObject.toobarWidths;
    const toobarElements = Store.toobarObject.toobarElements;
    let moreButtonIndex = 0;

    // When you resize the window during initialization, you will find that the dom has not been rendered yet
    if(toobarWidths == undefined){
        return;
    }
    // 找到应该隐藏的起始元素位置
    for (let index = toobarWidths.length - 1; index >= 0; index--) {

        // #luckysheet-icon-morebtn button width plus right is 83px
        if(toobarWidths[index] < gridW - 90){
            moreButtonIndex = index;
            if(moreButtonIndex < toobarWidths.length - 1){

                ismore = true;
            }
            break;
        }
    }
    // 从起始位置开始，后面的元素统一挪到下方隐藏DIV中
    for (let index = moreButtonIndex; index < toobarElements.length; index++) {
        const element = toobarElements[index];
        if(element instanceof Array){
            for(const ele of element){
                document.getElementById("luckysheet-icon-morebtn-div").insertAdjacentHTML('beforeend', ele);
            }
        }else{
            document.getElementById("luckysheet-icon-morebtn-div").insertAdjacentHTML('beforeend', element);
        }

    }

    if(ismore){

        document.getElementById("luckysheet-wa-editor").insertAdjacentHTML('beforeend', morebtn);
        document.getElementById("luckysheet-icon-morebtn").addEventListener("click", function(){

            //When resize, change the width of the more button container in real time
            document.getElementById("luckysheet-icon-morebtn-div").style.left = '';//reset

            // *这里计算containerLeft的作用是：获得容器左侧的margin值，以让点击出现的“更多按钮”栏位置不会出错。
            const containerLeft = document.querySelector(`#${Store.container}`).getBoundingClientRect ? document.querySelector(`#${Store.container}`).getBoundingClientRect().left : 0;
            const morebtnLeft = document.getElementById("luckysheet-icon-morebtn-div").getBoundingClientRect().left;//get real left info

            if(morebtnLeft < containerLeft){
                document.getElementById("luckysheet-icon-morebtn-div").style.left = containerLeft + 'px';
            }

            let right = document.documentElement.clientWidth - document.getElementById("luckysheet-icon-morebtn").getBoundingClientRect().left + window.pageXOffset - document.getElementById("luckysheet-icon-morebtn").offsetWidth+ document.body.scrollLeft;


            // document.getElementById("luckysheet-icon-morebtn-div").toggle().style.right = right < 0 ? 0 : right;

            // use native js operation
            document.getElementById("luckysheet-icon-morebtn-div").style.right = right < 0 ? 0 : right + 'px';

            // change to visibility,morebtnLeft will get the actual value
            if(document.getElementById("luckysheet-icon-morebtn-div").style.visibility === 'hidden'){
                document.getElementById("luckysheet-icon-morebtn-div").style.visibility = 'visible';
            }else{
                document.getElementById("luckysheet-icon-morebtn-div").style.visibility = 'hidden';
            }

            let $txt = this.querySelector(".luckysheet-toolbar-menu-button-caption");
            if($txt.textContent.indexOf(locale_toolbar.toolMore) > -1){

                const toolCloseHTML = `
                <div class="luckysheet-toolbar-menu-button-caption luckysheet-inline-block" style="user-select: none;">
                    ${locale_toolbar.toolClose}
                </div>
                <div class="luckysheet-toolbar-menu-button-dropdown luckysheet-inline-block iconfont-luckysheet luckysheet-iconfont-shangyige" style="user-select: none;font-size:12px;">
                </div>
                `
                this.querySelector(".luckysheet-toolbar-button-inner-box").innerHTML = toolCloseHTML;
            }
            else{

                const toolMoreHTML = `
                <div class="luckysheet-toolbar-menu-button-caption luckysheet-inline-block" style="user-select: none;">
                    ${locale_toolbar.toolMore}
                </div>
                <div class="luckysheet-toolbar-menu-button-dropdown luckysheet-inline-block iconfont-luckysheet luckysheet-iconfont-xiayige" style="user-select: none;font-size:12px;">
                </div>
                `

                const _el = this.querySelector(".luckysheet-toolbar-button-inner-box"); if (_el) _el.innerHTML = toolMoreHTML;
            }

        });
        //document.querySelector("#luckysheet-wa-editor div").dispatchEvent(new Event("create", {bubbles: true}));

        // document.querySelector("#luckysheet-icon-morebtn-div .luckysheet-toolbar-menu-button").style.marginRight = -1;
        // document.querySelector("#luckysheet-icon-morebtn-div .luckysheet-toolbar-button-split-left").style.marginRight = -3;

        // “更多”容器中，联动hover效果
        const splitLeft = document.querySelector("#luckysheet-icon-morebtn-div .luckysheet-toolbar-button-split-left");
        splitLeft.addEventListener("mouseenter", function() {
            const next = this.nextElementSibling;
            if (next && next.matches(".luckysheet-toolbar-button-split-right")) {
                next.classList.add("luckysheet-toolbar-button-split-right-hover");
            }
        });
        splitLeft.addEventListener("mouseleave", function() {
            const next = this.nextElementSibling;
            if (next && next.matches(".luckysheet-toolbar-button-split-right")) {
                next.classList.remove("luckysheet-toolbar-button-split-right-hover");
            }
        });

        const splitRight = document.querySelector("#luckysheet-icon-morebtn-div .luckysheet-toolbar-button-split-right");
        splitRight.addEventListener("mouseenter", function() {
            const prev = this.previousElementSibling;
            if (prev && prev.matches(".luckysheet-toolbar-button-split-left")) {
                prev.classList.add("luckysheet-toolbar-button-hover");
            }
        });
        splitRight.addEventListener("mouseleave", function() {
            const prev = this.previousElementSibling;
            if (prev && prev.matches(".luckysheet-toolbar-button-split-left")) {
                prev.classList.remove("luckysheet-toolbar-button-hover");
            }
        });

        // tooltip
        tooltip.createHoverTip("#luckysheet-icon-morebtn-div" ,".luckysheet-toolbar-menu-button, .luckysheet-toolbar-button, .luckysheet-toolbar-combo-button");
    }

    let _splitLeft = document.querySelector("#"+ Store.container + " .luckysheet-wa-editor .luckysheet-toolbar-button-split-left");
    if (_splitLeft) {
        _splitLeft.addEventListener("mouseenter", function() {
            let _next = this.nextElementSibling;
            if (_next && _next.matches(".luckysheet-toolbar-button-split-right")) _next.classList.add("luckysheet-toolbar-button-split-right-hover");
        });
        _splitLeft.addEventListener("mouseleave", function() {
            let _next = this.nextElementSibling;
            if (_next && _next.matches(".luckysheet-toolbar-button-split-right")) _next.classList.remove("luckysheet-toolbar-button-split-right-hover");
        });
    }

    let _splitRight = document.querySelector("#"+ Store.container + " .luckysheet-wa-editor .luckysheet-toolbar-button-split-right");
    if (_splitRight) {
        _splitRight.addEventListener("mouseenter", function() {
            let _prev = this.previousElementSibling;
            if (_prev && _prev.matches(".luckysheet-toolbar-button-split-left")) _prev.classList.add("luckysheet-toolbar-button-hover");
        });
        _splitRight.addEventListener("mouseleave", function() {
            let _prev = this.previousElementSibling;
            if (_prev && _prev.matches(".luckysheet-toolbar-button-split-left")) _prev.classList.remove("luckysheet-toolbar-button-hover");
        });
    }

    // When adding elements to the luckysheet-icon-morebtn-div element of the toolbar, it will affect the height of the entire workbook area, so the height is obtained here
    gridH = document.getElementById(Store.container).offsetHeight;

    let _luckysheetEl = document.getElementById(Store.container).querySelector(".luckysheet");
    _luckysheetEl.style.height = gridH - 2 + 'px';
    _luckysheetEl.style.width = gridW - 2 + 'px';

    changeSheetContainerSize(gridW, gridH)

    if(isRefreshCanvas){
        let scroll = getScrollPosition();
        luckysheetrefreshgrid(scroll.scrollLeft, scroll.scrollTop);
    }

    sheetmanage.sheetArrowShowAndHide();
    sheetmanage.sheetBarShowAndHide();
}


export function changeSheetContainerSize(gridW, gridH){
    if(gridW==null){
        gridW = document.getElementById(Store.container).offsetWidth;
    }

    if(gridH==null){
        gridH = document.getElementById(Store.container).offsetHeight;
    }
    Store.cellmainHeight = gridH - (getHeaderTotalHeight() + Store.sheetBarHeight + Store.statisticBarHeight);
    Store.cellmainWidth = gridW - Store.rowHeaderWidth;

    colHeader.setWidth(Store.cellmainWidth);
    cellMain.setWidth(Store.cellmainWidth);
    cellMain.setHeight(Store.cellmainHeight);
    rowHeader.setHeight(Store.cellmainHeight - Store.cellMainSrollBarSize);

    scrollBarY.setHeight(Store.cellmainHeight + Store.columnHeaderHeight - Store.cellMainSrollBarSize - 3);
    scrollBarX.setHeight(Store.cellMainSrollBarSize);
    scrollBarY.setWidth(Store.cellMainSrollBarSize);

    scrollBarX.setWidth(Store.cellmainWidth).setCssLeft(Store.rowHeaderWidth - 2);

    Store.luckysheetTableContentHW = [
        Store.cellmainWidth + Store.rowHeaderWidth - Store.cellMainSrollBarSize,
        Store.cellmainHeight + Store.columnHeaderHeight - Store.cellMainSrollBarSize
    ];

    canvasContext.setCanvasSize(
        Math.ceil(Store.luckysheetTableContentHW[0] * Store.devicePixelRatio),
        Math.ceil(Store.luckysheetTableContentHW[1] * Store.devicePixelRatio),
        Store.luckysheetTableContentHW[0],
        Store.luckysheetTableContentHW[1]
    );

    document.getElementById(Store.container).querySelector(".luckysheet-grid-window").style.bottom = Store.statisticBarHeight;
    gridWindow.setCssBottom(Store.sheetBarHeight);

    let gridwidth = gridWindow.getWidth();
    Object.assign(document.getElementById("luckysheet-freezebar-horizontal").querySelector(".luckysheet-freezebar-horizontal-handle").style, { "width": gridwidth - 10 });
    Object.assign(document.getElementById("luckysheet-freezebar-horizontal").querySelector(".luckysheet-freezebar-horizontal-drop").style, { "width": gridwidth - 10 });

    let gridheight = gridWindow.getHeight();
    Object.assign(document.getElementById("luckysheet-freezebar-vertical").querySelector(".luckysheet-freezebar-vertical-handle").style, { "height": gridheight - 10 });
    Object.assign(document.getElementById("luckysheet-freezebar-vertical").querySelector(".luckysheet-freezebar-vertical-drop").style, { "height": gridheight - 10 });

    luckysheetFreezen.createAssistCanvas();
}

/**
 *
 *
 * Toolbar judgment rules: First set the display and hide of all tool buttons according to showtoolbar, and then override the judgment of showtoolbar according to showtoolbarConfig rules
 *
 * The width value of each button in the statistics toolbar is used to calculate which needs to be placed in more buttons
 */
export function menuToolBarWidth() {
    const showtoolbar = luckysheetConfigsetting.showtoolbar;
    const showtoolbarConfig = luckysheetConfigsetting.showtoolbarConfig;

    const toobarWidths = Store.toobarObject.toobarWidths = [];
    const toobarElements = Store.toobarObject.toobarElements = [];
    const toolbarConfig = Store.toobarObject.toolbarConfig = buildBoolBarConfig();

    /**
     * 基于 showtoolbarConfig 配置 动态生成 toolbarConfig
     * @returns {object}
     * @input showtoolbarConfig = ['undo', 'redo', '|' , 'font' , 'moreFormats', '|']
     * {
     *     undo: {ele: '#luckysheet-icon-undo', index: 0},
     *     redo: {ele: ['#luckysheet-icon-redo', '#luckysheet-separator-redo'], index: 1},
     *     undo: {ele: '#luckysheet-icon-font', index: 2},
     *     moreFormats: {ele: ['#luckysheet-icon-fmt-other', '#luckysheet-separator-more-formats'], index: 3},
     * }
     */
    function buildBoolBarConfig() {
        let obj = {};
        function array2Config(arr) {
            const obj = {};
            let current,next;
            let index = 0;
            for (let i = 0; i<arr.length; i++) {
                current = arr[i];
                next = arr[i + 1];
                if (current !== '|') {
                    obj[current] = {
                        ele: toolbarIdMap[current],
                        index: index++
                    }
                }
                if (next === '|') {
                    if (getObjType(obj[current].ele) === 'array') {
                        obj[current].ele.push(`#toolbar-separator-${camel2split(current)}`);
                    } else {
                        obj[current].ele = [obj[current].ele, `#toolbar-separator-${camel2split(current)}`];
                    }
                }
            }
            return obj;
        }
        // 数组形式直接生成
        if (getObjType(showtoolbarConfig) === 'array') {
            // show 为 false
            if (!showtoolbar) {
                return obj;
            }
            return array2Config(showtoolbarConfig);
        }
        // 否则为全部中从记录中挑选显示或隐藏
        const config = defaultToolbar.reduce(function(total, curr) {
            if (curr !== '|') {
                total[curr] = true;
            }
            return total;
        }, {});
        if (!showtoolbar) {
            for (let s in config) {
                config[s] = false;
            }
        }

        if (JSON.stringify(showtoolbarConfig) !== '{}') {
            if(showtoolbarConfig.hasOwnProperty('undoRedo')){
                config.undo = config.redo = showtoolbarConfig.undoRedo;

            }
            Object.assign(config, showtoolbarConfig);

            let current,next;
            let index = 0;
            for (let i = 0; i<defaultToolbar.length; i++) {
                current = defaultToolbar[i];
                next = defaultToolbar[i + 1];
                if (config[current] === false) {
                    continue;
                }
                if (current !== '|' && config[current]) {

                    obj[current] = {
                        ele: toolbarIdMap[current],
                        index: index++
                    }
                }
                if (next === '|') {
                    if (getObjType(obj[current].ele) === 'array') {
                        obj[current].ele.push(`#toolbar-separator-${camel2split(current)}`);
                    } else {
                        obj[current].ele = [obj[current].ele, `#toolbar-separator-${camel2split(current)}`];
                    }
                }
            }
        } else {
            obj = showtoolbar ? array2Config(defaultToolbar) : {};
        }

        return obj;
    }

    for (let s in toolbarConfig){
        if (Object.prototype.hasOwnProperty.call(toolbarConfig, s)) {
            toobarElements.push(structuredClone(toolbarConfig[s]));
        }
    }

    toobarElements.sort(sortToolbar);

    function sortToolbar(a,b) {
        if(a.index > b.index){
            return 1;
        }else{
            return -1;
        }
    }
    toobarElements.forEach((curr,index,arr)=>{
        arr[index] = curr.ele;

        if(index !== toobarElements.length - 1){
            if(curr.ele instanceof Array){
                toobarWidths.push(document.querySelector(curr.ele[0]).getBoundingClientRect().left + window.pageXOffset);
            }else{
                toobarWidths.push(curr.ele.getBoundingClientRect().left + window.pageXOffset);
            }
        }else{
            if(curr.ele instanceof Array){
                toobarWidths.push(document.querySelector(curr.ele[0]).getBoundingClientRect().left + window.pageXOffset);
                toobarWidths.push(document.querySelector(curr.ele[0]).getBoundingClientRect().left + window.pageXOffset + document.querySelector(curr.ele[0]).offsetWidth + 5);
            }else{
                toobarWidths.push(curr.ele.getBoundingClientRect().left + window.pageXOffset);
                toobarWidths.push(curr.ele.getBoundingClientRect().left + window.pageXOffset + curr.ele.offsetWidth + 5);
            }
        }

    });

    //If the container does not occupy the full screen, we need to subtract the left margin
    const containerLeft = document.getElementById(Store.container).getBoundingClientRect().left + window.pageXOffset;
    toobarWidths.forEach((item,i)=>{
        toobarWidths[i] -= containerLeft;
    })

}

/**
 *Custom configuration bottom sheet button
 */
function customSheetbarConfig() {

    if(!luckysheetConfigsetting.initShowsheetbarConfig){

        luckysheetConfigsetting.initShowsheetbarConfig = true;

        const config = {
            add: true, //Add worksheet
            menu: true, //Worksheet management menu
            sheet: true //Worksheet display
        }

        if(!luckysheetConfigsetting.showsheetbar){
            for(let s in config){
                config[s] = false;
            }
        }

        // showsheetbarConfig determines the final result
        if(JSON.stringify(luckysheetConfigsetting.showsheetbarConfig) !== '{}'){
            Object.assign(config,luckysheetConfigsetting.showsheetbarConfig);
        }

        luckysheetConfigsetting.showsheetbarConfig = config;

    }

    const config = luckysheetConfigsetting.showsheetbarConfig;

    let isHide = 0;

    for (let s in config) {
        if(!config[s]){
            switch (s) {
                case 'add':
                    document.getElementById("luckysheet-sheets-add").style.display = 'none';
                    isHide++;
                    break;

                case 'menu':
                    document.getElementById("luckysheet-sheets-m").style.display = 'none';
                    isHide++;
                    break;

                case 'sheet':
                    document.getElementById("luckysheet-sheet-container").style.display = 'none';
                    document.getElementById("luckysheet-sheets-leftscroll").style.display = 'none';
                    document.getElementById("luckysheet-sheets-rightscroll").style.display = 'none';
                    isHide++;
                    break;

                default:
                    break;
            }
        }
    }

    if (isHide === 3) {
        document.getElementById(Store.container).querySelector("#luckysheet-sheet-area").style.display = 'none';
        Store.sheetBarHeight = 0;
    }
    else {
        document.getElementById(Store.container).querySelector("#luckysheet-sheet-area").style.display = '';
        Store.sheetBarHeight = 31;
    }
}


/**
 * Customize the bottom count bar
 */
function customStatisticBarConfig() {
    if(!luckysheetConfigsetting.initStatisticBarConfig){

        luckysheetConfigsetting.initStatisticBarConfig = true;

        const config = {
            count: true, // Count bar
            view: true, // print view
            zoom: true // Zoom
        }

        if(!luckysheetConfigsetting.showstatisticBar){
            for(let s in config){
                config[s] = false;
            }
        }

        // showstatisticBarConfig determines the final result
        if(JSON.stringify(luckysheetConfigsetting.showstatisticBarConfig) !== '{}'){
            Object.assign(config,luckysheetConfigsetting.showstatisticBarConfig);
        }

        luckysheetConfigsetting.showstatisticBarConfig = config;

    }

    const config = luckysheetConfigsetting.showstatisticBarConfig;

    let isHide = 0;

    for (let s in config) {
        if(!config[s]){
            switch (s) {
                case 'count':
                    document.getElementById("luckysheet-sta-content").style.display = 'none';
                    isHide++;
                    break;

                case 'view':
                    document.querySelector('.luckysheet-print-viewList').style.display = 'none';
                    isHide++;
                    break;

                case 'zoom':
                    document.getElementById("luckysheet-zoom-content").style.display = 'none';
                    isHide++;
                    break;

                default:
                    break;
            }
        }
    }

    if (isHide === 3) {
        document.getElementById(Store.container).querySelector(".luckysheet-stat-area").style.display = 'none';
        Store.statisticBarHeight = 0;
    }
    else {
        document.getElementById(Store.container).querySelector(".luckysheet-stat-area").style.display = '';
        Store.statisticBarHeight = 23;
    }
}
