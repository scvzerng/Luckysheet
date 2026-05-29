import luckysheetFreezen from './freezen';
import menuButton from './menuButton';
import conditionformat from './conditionformat';
import alternateformat from './alternateformat';
import cellDatePickerCtrl from './cellDatePickerCtrl';
import { chatatABC } from '../utils/util';
import { isEditMode } from '../global/validate';
import { getcellvalue,getInlineStringStyle } from '../global/getdata';
import { valueShowEs } from '../global/format';
import formula from '../global/formula';
import { luckysheetRangeLast } from '../global/cursorPos';
import cleargridelement from '../global/cleargridelement';
import {isInlineStringCell} from './inlineString';
import Store from '../store';
import { getHeaderTotalHeight } from '../utils/storeAccess.js';
import { getScrollPosition, resetInputBoxStyle } from '../utils/domUtils.js';
import method from '../global/method';
import richTextEditor from '../ui/richTextEditor.js';
import inputBox from '../ui/inputBox.js';
import inputBoxIndex from '../ui/inputBoxIndex.js';
import functionBox from '../ui/functionBox.js';

export function luckysheetupdateCell(row_index1, col_index1, d, cover, isnotfocus) {
    if(isEditMode() || Store.allowEdit===false){//此模式下禁用单元格编辑
        return;
    }

    // 钩子函数
    if(!method.createHookFunction('cellEditBefore',Store.luckysheet_select_save)){return;}

    // 编辑单元格时发送指令到后台，通知其他单元格更新为"正在输入"状态

    let size = getColumnAndRowSize(row_index1, col_index1, d);
    let row = size.row, 
        row_pre = size.row_pre, 
        col = size.col, 
        col_pre = size.col_pre, 
        row_index = size.row_index, 
        col_index = size.col_index;

    let _elDropCellIcon = document.getElementById("luckysheet-dropCell-icon");
    if(_elDropCellIcon && _elDropCellIcon.offsetWidth > 0){
        _elDropCellIcon.remove();
    }

    let winH = document.documentElement.clientHeight, winW = document.documentElement.clientWidth;
    let _elContainer = document.getElementById(Store.container);
    let container_offset = _elContainer ? {top: _elContainer.getBoundingClientRect().top + window.pageYOffset, left: _elContainer.getBoundingClientRect().left + window.pageXOffset} : {top: 0, left: 0};
    let scroll = getScrollPosition();
    let scrollLeft = scroll.scrollLeft;
    let scrollTop = scroll.scrollTop;

    let left = col_pre + container_offset.left + Store.rowHeaderWidth - scrollLeft - 2;
    if(luckysheetFreezen.freezenverticaldata != null && col_index1 <= luckysheetFreezen.freezenverticaldata[1]){
        left = col_pre + container_offset.left + Store.rowHeaderWidth - 2;
    }

    let top = row_pre + container_offset.top + getHeaderTotalHeight() - scrollTop - 2;
    if(luckysheetFreezen.freezenhorizontaldata != null && row_index1 <= luckysheetFreezen.freezenhorizontaldata[1]){
        top = row_pre + container_offset.top + getHeaderTotalHeight() - 2;
    }

    let input_postition = {
        "min-width": col - col_pre+ 1- 8, 
        "min-height": row - row_pre + 1- 4,  
        
        "max-width": winW + scrollLeft - col_pre - 20 - Store.rowHeaderWidth, 
        "max-height": winH + scrollTop - row_pre - 20 - 15 - Store.toolbarHeight - Store.infobarHeight - Store.calculatebarHeight - Store.sheetBarHeight - Store.statisticBarHeight, 
        "left": left, 
        "top": top, 
    }

    let inputContentScale = {
        "transform":"scale("+ Store.zoomRatio +")",
        "transform-origin":"left top",
        "width":(100 / Store.zoomRatio) + "%",
        "height":(100 / Store.zoomRatio) + "%",
    }

    Store.luckysheetCellUpdate = [row_index, col_index];
    if (!isnotfocus) {
        richTextEditor.focus().select();
    }

    resetInputBoxStyle();
    inputBox.setCss({
        "background-color": "rgb(255, 255, 255)",
        "padding": "0px 2px",
        "font-size": `${Store.defaultFontSize}pt`,
        "right": "auto",
        "overflow-y": "auto",
        "box-sizing": "initial",
        "display":"flex",
    });

    if(luckysheetFreezen.freezenverticaldata != null || luckysheetFreezen.freezenhorizontaldata != null){
        inputBox.setCss({"z-index": 10002});
    }
    
    inputBoxIndex.setCellRef(chatatABC(col_index) + (row_index + 1)).hide();
    functionBox.setActive();
    
    let value = "", isCenter=false;
    
    if (d[row_index] != null && d[row_index][col_index] != null) {
        let cell = d[row_index][col_index];
        let htValue = cell["ht"];
        let leftOrigin = "left", topOrigin = "top";
        if(htValue == "0"){//0 center, 1 left, 2 right
            input_postition = { 
                "min-width": col - col_pre + 1- 8, 
                "min-height": row - row_pre + 1- 4, 
                // "transform":"scale("+ Store.zoomRatio +")",
                // "transform-origin":"center top",
                "max-width": winW*2/3, 
                "max-height": winH + scrollTop - row_pre - 20 - 15 - Store.toolbarHeight - Store.infobarHeight - Store.calculatebarHeight - Store.sheetBarHeight - Store.statisticBarHeight, 
                "left": col_pre + container_offset.left + Store.rowHeaderWidth - scrollLeft - 2, 
                "top":  row_pre + container_offset.top + getHeaderTotalHeight() - scrollTop - 2,
            }

            if(Store.zoomRatio<1){
                leftOrigin = "center";
            }

            isCenter = true;
        }
        else if(htValue == "2"){
            input_postition = {
                "min-width": col - col_pre+ 1- 8,
                "min-height": row - row_pre + 1- 4,
                // "transform":"scale("+ Store.zoomRatio +")",
                // "transform-origin":"right top",
                "max-width": col + container_offset.left - scrollLeft  - 8,
                "max-height": winH + scrollTop - row_pre - 20 - 15 - Store.toolbarHeight - Store.infobarHeight - Store.calculatebarHeight - Store.sheetBarHeight - Store.statisticBarHeight,
                "right": winW - (container_offset.left + (Store.rowHeaderWidth-1) - scrollLeft) - col,
                "top":  row_pre + container_offset.top + getHeaderTotalHeight() - scrollTop - 2,
            }

            if(Store.zoomRatio<1){
                leftOrigin = "right";
            }
        }

        if(cell["vt"]=="0"){
            topOrigin = "center";
        }
        else if(cell["vt"]=="2"){
            topOrigin = "bottom";
        }

        inputContentScale["transform-origin"] = leftOrigin +" " + topOrigin;

        
        if (!cover) {
            if(isInlineStringCell(cell)){
                value = getInlineStringStyle(row_index, col_index, d);
            }
            else if(cell.f!=null){
                value = getcellvalue(row_index, col_index, d, "f");
            }
            else{
                value = valueShowEs(row_index, col_index, d);
                if(cell.qp=="1"){
                    value = value ? ("" + value) : value;
                }
            }
        }
        
        let style = menuButton.getStyleByCell(d, row_index, col_index);
        let nativeEl = inputBox.el;
        if (!nativeEl) return;
        style = nativeEl.style.cssText + style;

        inputBox.setStyleCssText(style);
        if(nativeEl.style.backgroundColor == "rgba(0, 0, 0, 0)"){
            inputBox.setStyleBackground("rgb(255,255,255)");
        }
    }
    else{
        //交替颜色
        let af_compute = alternateformat.getComputeMap();
        var checksAF = alternateformat.checksAF(row_index, col_index, af_compute);

        //条件格式
        var cf_compute = conditionformat.getComputeMap();
        var checksCF = conditionformat.checksCF(row_index, col_index, cf_compute);

        if(checksCF != null && checksCF["cellColor"] != null){
            inputBox.setStyleBackground(checksCF["cellColor"]);
        }
        else if(checksAF != null){
            inputBox.setStyleBackground(checksAF[1]);
        }
    }

    if(input_postition["min-height"] > input_postition["max-height"]){
        input_postition["min-height"] = input_postition["max-height"];
    }

    if(input_postition["min-width"] > input_postition["max-width"]){
        input_postition["min-width"] = input_postition["max-width"];
    }
   
    // if((value == null || value.toString() == "") && !cover){
    //     value = "<br/>";
    // }
    value = formula.xssDeal(value);
    value = formula.ltGtSignDeal(value);
    richTextEditor.setHtml(value);
    if (!isnotfocus) {
        luckysheetRangeLast(richTextEditor.getNativeElement());
    }

    if(isCenter){
        let width = inputBox.getWidth();
        if(width> input_postition["max-width"]){
            width = input_postition["max-width"];
        }

        if(width< input_postition["min-width"]){
            width = input_postition["min-width"];
        }

        let newLeft = input_postition["left"] - width/2 + (col - col_pre)/2;
        if(newLeft<2){
            newLeft = 2;
        }

        input_postition["left"] = newLeft-2;
    }

    inputBox.setCss(input_postition);
    richTextEditor.setCss(inputContentScale);

    //日期
    if(d[row_index1][col_index1] && d[row_index1][col_index1].ct && d[row_index1][col_index1].ct.t == 'd'){
        cellDatePickerCtrl.cellFocus(row_index1, col_index1, d[row_index1][col_index1]);
    }

    formula.rangetosheet = Store.currentSheetIndex;
    formula.createRangeHightlight();
    formula.rangeResizeTo = richTextEditor.el;
    cleargridelement();
}

export function setCenterInputPosition(row_index, col_index, d){
    if(row_index==null ||col_index==null){
        return;
    }
    let cell = d[row_index][col_index];
    if(cell==null){
        return;
    }
    let htValue = cell["ht"];
    if(cell!=null && htValue != "0"){//0 center, 1 left, 2 right
        return;
    }

    let size = getColumnAndRowSize(row_index, col_index, d);
    let row = size.row, row_pre = size.row_pre, col = size.col, col_pre = size.col_pre;

    let winH = document.documentElement.clientHeight, winW = document.documentElement.clientWidth;
    let _elContainer2 = document.getElementById(Store.container);
    let container_offset = _elContainer2 ? {top: _elContainer2.getBoundingClientRect().top + window.pageYOffset, left: _elContainer2.getBoundingClientRect().left + window.pageXOffset} : {top: 0, left: 0};
    let scroll = getScrollPosition();
    let scrollLeft = scroll.scrollLeft;
    let scrollTop = scroll.scrollTop;

    let input_postition = { 
        "min-width": col - col_pre + 1 - 8, 
        "max-width": winW*2/3, 
        "left": col_pre + container_offset.left + Store.rowHeaderWidth - scrollLeft - 2, 
    }

    let width = inputBox.getWidth();
    if(width> input_postition["max-width"]){
        width = input_postition["max-width"];
    }

    if(width< input_postition["min-width"]){
        width = input_postition["min-width"];
    }

    let newLeft = input_postition["left"] - width/2 + (col - col_pre)/2;
    if(newLeft<2){
        newLeft = 2;
    }

    input_postition["left"] = newLeft-2;

    inputBox.setCss(input_postition);
}

export function getColumnAndRowSize(row_index, col_index, d){
    let row = Store.visibledatarow[row_index], 
        row_pre = row_index - 1 == -1 ? 0 : Store.visibledatarow[row_index - 1];
    let col = Store.visibledatacolumn[col_index], 
        col_pre = col_index - 1 == -1 ? 0 : Store.visibledatacolumn[col_index - 1];

    if(d == null){
        d = Store.flowdata;
    }

    let margeset = menuButton.mergeborer(d, row_index, col_index);
    if(margeset){
        row = margeset.row[1];
        row_pre = margeset.row[0];
        row_index = margeset.row[2];
        col = margeset.column[1];
        col_pre = margeset.column[0];
        col_index = margeset.column[2];
    }    

    return {
        row: row,
        row_pre: row_pre,
        row_index: row_index,
        col: col,
        col_pre: col_pre,
        col_index: col_index
    }
}
