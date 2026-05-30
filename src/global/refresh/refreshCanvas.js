import rhchInit from '../rhchInit';
import formula from '../formula';
import { 
    luckysheetDrawMain, 
    luckysheetDrawgridRowTitle, 
    luckysheetDrawgridColumnTitle 
} from '../draw';
import luckysheetFreezen from '../../controllers/freezen';
import sheetmanage from '../../controllers/sheetmanage';
import luckysheetPostil from '../../controllers/postil';
import { getCurrentFile, syncDataToStore } from '../../utils/storeAccess.js';
import { selectHightlightShow, selectionCopyShow } from '../../controllers/select';
import Store from '../../store';
import { getScrollPosition } from '../../utils/domUtils.js';
import canvasContext from '../../ui/canvasContext.js';

import { clearRefreshCanvasTimeOut, setRefreshCanvasTimeOut } from './refreshState';

function jfrefreshgrid_rhcw(rowheight, colwidth, isRefreshCanvas=true){
    rhchInit(rowheight, colwidth);
    clearRefreshCanvasTimeOut();
    sheetmanage.storeSheetParam();

    let calcChain = getCurrentFile().calcChain;

    if(calcChain != null && calcChain !== null){
        if(Store.config["rowlen"] == null){
            Store.config["rowlen"] = {};
        }

        if(Store.config["columnlen"] == null){
            Store.config["columnlen"] = {};
        }

        syncDataToStore();
    }
    
    //批注框同步
    luckysheetPostil.positionSync();
    //选区同步
    selectHightlightShow();
    //改变单元格行高，复制虚线框同步
    if(document.querySelector(".luckysheet-selection-copy")?.offsetWidth > 0){
        selectionCopyShow();
    }

    //改变单元格行高，选区下拉icon隐藏
    if(document.getElementById("luckysheet-dropCell-icon")?.offsetWidth > 0){
        document.getElementById("luckysheet-dropCell-icon")?.remove();
    }

    //有冻结状态时，同步行高、列宽
    if(luckysheetFreezen.freezenhorizontaldata != null && luckysheetFreezen.freezenverticaldata != null){
        let row_st = luckysheetFreezen.freezenhorizontaldata[1] - 1;
        let col_st = luckysheetFreezen.freezenverticaldata[1] - 1;

        let scrollTop = luckysheetFreezen.freezenhorizontaldata[2];
        let scrollLeft = luckysheetFreezen.freezenverticaldata[2];

        let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
        let freezenhorizontaldata = [
            Store.visibledatarow[row_st], 
            row_st + 1, 
            scrollTop, 
            luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), 
            top
        ];
        let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
        let freezenverticaldata = [
            Store.visibledatacolumn[col_st], 
            col_st + 1, 
            scrollLeft, 
            luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), 
            left
        ];

        luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, freezenverticaldata, left);
        luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
        luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
        luckysheetFreezen.createAssistCanvas();
    }
    else if(luckysheetFreezen.freezenhorizontaldata != null){
        let row_st = luckysheetFreezen.freezenhorizontaldata[1] - 1;
        let scrollTop = luckysheetFreezen.freezenhorizontaldata[2];

        let top = Store.visibledatarow[row_st] - 2 - scrollTop + Store.columnHeaderHeight;
        let freezenhorizontaldata = [
            Store.visibledatarow[row_st], 
            row_st + 1, 
            scrollTop, 
            luckysheetFreezen.cutVolumn(Store.visibledatarow, row_st + 1), 
            top
        ];

        luckysheetFreezen.saveFreezen(freezenhorizontaldata, top, null, null);
        luckysheetFreezen.createFreezenHorizontal(freezenhorizontaldata, top);
        luckysheetFreezen.createAssistCanvas();
    }
    else if(luckysheetFreezen.freezenverticaldata != null){
        let col_st = luckysheetFreezen.freezenverticaldata[1] - 1;
        let scrollLeft = luckysheetFreezen.freezenverticaldata[2];

        let left = Store.visibledatacolumn[col_st] - 2 - scrollLeft + Store.rowHeaderWidth;
        let freezenverticaldata = [
            Store.visibledatacolumn[col_st], 
            col_st + 1, 
            scrollLeft, 
            luckysheetFreezen.cutVolumn(Store.visibledatacolumn, col_st + 1), 
            left
        ];

        luckysheetFreezen.saveFreezen(null, null, freezenverticaldata, left);
        luckysheetFreezen.createFreezenVertical(freezenverticaldata, left);
        luckysheetFreezen.createAssistCanvas();
    }
    else{
        //有筛选标志时，同步筛选按钮和筛选范围位置
        if(document.querySelector("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options") !== null){
            document.querySelectorAll("#luckysheet-filter-options-sheet" + Store.currentSheetIndex + " .luckysheet-filter-options").forEach(function(e) {
                let str = e.dataset.str, cindex = e.dataset.cindex;

                let left = Store.visibledatacolumn[cindex] - 20;
                let top = str - 1 == -1 ? 0 : Store.visibledatarow[str - 1];

                Object.assign(e.style, { "left": left + "px", "top": top + "px" });
            });
        }
    }

    if(document.getElementById("luckysheet-filter-selected-sheet" + Store.currentSheetIndex) !== null){
        let luckysheet_filter_save = getCurrentFile().filter_select;

        let r1 = luckysheet_filter_save.row[0], 
            r2 = luckysheet_filter_save.row[1];
        let c1 = luckysheet_filter_save.column[0], 
            c2 = luckysheet_filter_save.column[1];

        let row = Store.visibledatarow[r2], 
            row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
        let col = Store.visibledatacolumn[c2], 
            col_pre = c1 - 1 == -1 ? 0 : Store.visibledatacolumn[c1 - 1];

        const _filterSelected = document.getElementById("luckysheet-filter-selected-sheet" + Store.currentSheetIndex); if (_filterSelected) Object.assign(_filterSelected.style, {
            "left": col_pre + "px",
            "width": col - col_pre - 1 + "px",
            "top": row_pre + "px",
            "height": row - row_pre - 1 + "px"
        });
    }

    sheetmanage.showSheet();

    if(isRefreshCanvas){
        setRefreshCanvasTimeOut(setTimeout(function () {
            luckysheetrefreshgrid();
        }, 1));
    }
   
}

//Refresh the canvas display data according to scrollHeight and scrollWidth
function luckysheetrefreshgrid(scrollWidth, scrollHeight) {
    formula.groupValuesRefresh();
    
    if (scrollWidth == null) {
        let scroll = getScrollPosition();
        scrollWidth = scroll.scrollLeft;
    }
    if (scrollHeight == null) {
        let scroll = getScrollPosition();
        scrollHeight = scroll.scrollTop;
    }

    if (luckysheetFreezen.freezenverticaldata != null || luckysheetFreezen.freezenhorizontaldata != null) {
        let freezen_horizon_px, freezen_horizon_ed, freezen_horizon_scrollTop;
        let freezen_vertical_px, freezen_vertical_ed, freezen_vertical_scrollTop;
        let drawWidth = Store.luckysheetTableContentHW[0], drawHeight = Store.luckysheetTableContentHW[1];
        
        if (luckysheetFreezen.freezenverticaldata != null && luckysheetFreezen.freezenhorizontaldata != null) {
            freezen_horizon_px = luckysheetFreezen.freezenhorizontaldata[0];
            freezen_horizon_ed = luckysheetFreezen.freezenhorizontaldata[1];
            freezen_horizon_scrollTop = luckysheetFreezen.freezenhorizontaldata[2];

            freezen_vertical_px = luckysheetFreezen.freezenverticaldata[0];
            freezen_vertical_ed = luckysheetFreezen.freezenverticaldata[1];
            freezen_vertical_scrollTop = luckysheetFreezen.freezenverticaldata[2];

            //左上canvas freezen_3
            luckysheetDrawMain(
                freezen_vertical_scrollTop, 
                freezen_horizon_scrollTop, 
                freezen_vertical_px, 
                freezen_horizon_px, 
                1, 
                1, 
                null, 
                null, 
                "freezen_3"
            );

            //上右canvas freezen_4
            luckysheetDrawMain(
                scrollWidth + freezen_vertical_px - freezen_vertical_scrollTop, 
                freezen_horizon_scrollTop, 
                drawWidth - freezen_vertical_px + freezen_vertical_scrollTop, 
                freezen_horizon_px, 
                1, 
                1, 
                null, 
                null, 
                "freezen_4"
            );

            //左下canvas freezen_7
            luckysheetDrawMain(
                freezen_vertical_scrollTop, 
                scrollHeight + freezen_horizon_px - freezen_horizon_scrollTop, 
                freezen_vertical_px, 
                drawHeight - freezen_horizon_px + freezen_horizon_scrollTop, 
                1, 
                1, 
                null, 
                null, 
                "freezen_7"
            );

            //右下canvas luckysheetTableContent
            luckysheetDrawMain(
                scrollWidth + freezen_vertical_px - freezen_vertical_scrollTop, 
                scrollHeight + freezen_horizon_px - freezen_horizon_scrollTop, 
                drawWidth - freezen_vertical_px + freezen_vertical_scrollTop, 
                drawHeight - freezen_horizon_px + freezen_horizon_scrollTop, 
                freezen_vertical_px - freezen_vertical_scrollTop + Store.rowHeaderWidth, 
                freezen_horizon_px - freezen_horizon_scrollTop + Store.columnHeaderHeight
            );

            //标题
            luckysheetDrawgridColumnTitle(freezen_vertical_scrollTop, freezen_vertical_px, Store.rowHeaderWidth);
            luckysheetDrawgridColumnTitle(
                scrollWidth + freezen_vertical_px - freezen_vertical_scrollTop, 
                drawWidth - freezen_vertical_px + freezen_vertical_scrollTop, 
                freezen_vertical_px - freezen_vertical_scrollTop + Store.rowHeaderWidth
            );
            
            luckysheetDrawgridRowTitle(freezen_horizon_scrollTop, freezen_horizon_px, Store.columnHeaderHeight);
            luckysheetDrawgridRowTitle(
                scrollHeight + freezen_horizon_px - freezen_horizon_scrollTop, 
                drawHeight - freezen_horizon_px + freezen_horizon_scrollTop, 
                freezen_horizon_px - freezen_horizon_scrollTop + Store.columnHeaderHeight
            );
           
        }
        else if (luckysheetFreezen.freezenhorizontaldata != null) {
            freezen_horizon_px = luckysheetFreezen.freezenhorizontaldata[0];
            freezen_horizon_ed = luckysheetFreezen.freezenhorizontaldata[1];
            freezen_horizon_scrollTop = luckysheetFreezen.freezenhorizontaldata[2];

            luckysheetDrawMain(
                scrollWidth, 
                freezen_horizon_scrollTop, 
                drawWidth, 
                freezen_horizon_px, 
                1, 
                1, 
                null, 
                null, 
                "freezen_h"
            );
            luckysheetDrawMain(
                scrollWidth, 
                scrollHeight + freezen_horizon_px - freezen_horizon_scrollTop, 
                drawWidth, 
                drawHeight - freezen_horizon_px + freezen_horizon_scrollTop, 
                null, 
                freezen_horizon_px - freezen_horizon_scrollTop + Store.columnHeaderHeight
            );
        
            luckysheetDrawgridColumnTitle(scrollWidth, drawWidth, null);
            
            luckysheetDrawgridRowTitle(freezen_horizon_scrollTop, freezen_horizon_px, Store.columnHeaderHeight);
            luckysheetDrawgridRowTitle(
                scrollHeight + freezen_horizon_px - freezen_horizon_scrollTop, 
                drawHeight - freezen_horizon_px + freezen_horizon_scrollTop, 
                freezen_horizon_px - freezen_horizon_scrollTop + Store.columnHeaderHeight
            );
            
        }
        else if (luckysheetFreezen.freezenverticaldata != null) {
            freezen_vertical_px = luckysheetFreezen.freezenverticaldata[0];
            freezen_vertical_ed = luckysheetFreezen.freezenverticaldata[1];
            freezen_vertical_scrollTop = luckysheetFreezen.freezenverticaldata[2];
            
            luckysheetDrawMain(
                freezen_vertical_scrollTop, 
                scrollHeight, 
                freezen_vertical_px, 
                drawHeight, 
                1, 
                1, 
                null, 
                null, 
                "freezen_v"
            );
            luckysheetDrawMain(
                scrollWidth + freezen_vertical_px - freezen_vertical_scrollTop, 
                scrollHeight, 
                drawWidth - freezen_vertical_px + freezen_vertical_scrollTop, 
                drawHeight, 
                freezen_vertical_px - freezen_vertical_scrollTop + Store.rowHeaderWidth, 
                null
            );
            
            luckysheetDrawgridRowTitle(scrollHeight, drawHeight, null);
            
            luckysheetDrawgridColumnTitle(freezen_vertical_scrollTop, freezen_vertical_px, Store.rowHeaderWidth);
            luckysheetDrawgridColumnTitle(
                scrollWidth + freezen_vertical_px - freezen_vertical_scrollTop, 
                drawWidth - freezen_vertical_px + freezen_vertical_scrollTop, 
                freezen_vertical_px - freezen_vertical_scrollTop + Store.rowHeaderWidth
            );
            
        }
    }
    else {
        if(!canvasContext.exists()){
            return;
        }
        let luckysheetTableContent = canvasContext.getContext();
        luckysheetDrawMain(scrollWidth, scrollHeight);
    
        // luckysheetTableContent.clearRect(0, 0, 46, 20);
        
        luckysheetDrawgridColumnTitle(scrollWidth);
        luckysheetDrawgridRowTitle(scrollHeight);

        //清除canvas左上角区域 防止列标题栏序列号溢出显示
        
        luckysheetTableContent.clearRect(0, 0, (Store.rowHeaderWidth* Store.devicePixelRatio-1) , (Store.columnHeaderHeight* Store.devicePixelRatio-1) );
    }
}

export { luckysheetrefreshgrid, jfrefreshgrid_rhcw };
