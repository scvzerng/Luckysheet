import luckysheetConfigsetting from "../luckysheetConfigsetting";
import imageCtrl from "../imageCtrl";
import menuButton from "../menuButton";
import sheetmanage from "../sheetmanage";
import {
    selectHightlightShow,
    selectIsOverlap,
    selectionCopyShow,
    luckysheet_count_show,
    selectHelpboxFill,
} from "../select";

import {
    replaceHtml,
    getObjType,
    chatatABC,
    ArrayUnique,
    showrightclickmenu,
    luckysheetactiveCell,
    luckysheetContainerFocus,
    $$,
} from "../../utils/util";
import { rowLocation, colLocation, mouseposition } from "../../global/location";
import method from "../../global/method";
import Store from "../../store";

export default function cellDragDrop() {
    //监听拖拽
    document.getElementById("luckysheet-cell-main").addEventListener(
        "drop",
        function(e) {
            e.preventDefault();
            e.stopPropagation();

            let files = e.dataTransfer.files;

            //拖拽插入图片
            if (files.length == 1 && files[0].type.indexOf("image") > -1) {
                imageCtrl.insertImg(files[0]);
            }
            handleCellDragStopEvent(e);
        },
        false,
    );
    document.getElementById("luckysheet-cell-main").addEventListener(
        "dragover",
        function(e) {
            e.preventDefault();
            e.stopPropagation();
        },
        false,
    );

    /**
     * 处理单元格上鼠标拖拽停止事件
     * @param {DragEvent} event
     */
    function handleCellDragStopEvent(event) {
        if (luckysheetConfigsetting && luckysheetConfigsetting.hook && luckysheetConfigsetting.hook.cellDragStop) {
            let mouse = mouseposition(event.pageX, event.pageY);
            let x = mouse[0] + $("#luckysheet-cell-main").scrollLeft();
            let y = mouse[1] + $("#luckysheet-cell-main").scrollTop();

            let row_location = rowLocation(y),
                row = row_location[1],
                row_pre = row_location[0],
                row_index = row_location[2];
            let col_location = colLocation(x),
                col = col_location[1],
                col_pre = col_location[0],
                col_index = col_location[2];

            let margeset = menuButton.mergeborer(Store.flowdata, row_index, col_index);
            if (!!margeset) {
                row = margeset.row[1];
                row_pre = margeset.row[0];
                row_index = margeset.row[2];

                col = margeset.column[1];
                col_pre = margeset.column[0];
                col_index = margeset.column[2];
            }

            let sheetFile = sheetmanage.getSheetByIndex();

            let luckysheetTableContent = $("#luckysheetTableContent")
                .get(0)
                .getContext("2d");
            method.createHookFunction(
                "cellDragStop",
                Store.flowdata[row_index][col_index],
                {
                    r: row_index,
                    c: col_index,
                    start_r: row_pre,
                    start_c: col_pre,
                    end_r: row,
                    end_c: col,
                },
                sheetFile,
                luckysheetTableContent,
                event,
            );
        }
    }
}
