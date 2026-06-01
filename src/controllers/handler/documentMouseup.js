import { onNS, offNS } from '../../utils/migrationHelpers.js';
import luckysheetConfigsetting from "../luckysheetConfigsetting";
import luckysheetFreezen from "../freezen";
import luckysheetDropCell from "../dropCell";
import luckysheetPostil from "../postil";
import imageCtrl from "../imageCtrl";
import menuButton from "../menuButton";
import conditionformat from "../conditionformat";
import sheetmanage from "../sheetmanage";
import {
    selectHightlightShow,
    selectIsOverlap,
    selectionCopyShow,
    luckysheet_count_show,
    selectHelpboxFill,
} from "../select";
import selection from "../selection";

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
import { getCurrentFile, syncConfigToStore, getDataSize, getLastSelection, getMaxRowIndex, getMaxColIndex } from "../../utils/storeAccess.js";
import { rowLocation, colLocation, mouseposition } from "../../global/location";
import { rowlenByRange } from "../../global/getRowlen";
import {  hasPartMC,  isEditMode } from "../../global/validate";
import { countfunc } from "../../global/count";
import formula from "../../global/formula";
import { jfrefreshgrid, jfrefreshgrid_rhcw, luckysheetrefreshgrid } from "../../global/refresh";
import {  getdatabyselection } from "../../global/getdata";
import tooltip from "../../global/tooltip";
import editor from "../../global/editor";
import method from "../../global/method";
import { getBorderInfoCompute } from "../../global/border";
import Store from "../../store";
import context from "./context";
import { getScrollPosition } from '../../utils/domUtils.js';
import { rowHeader, colHeader } from '../../ui/rowColHeader.js';
import resizeHandles from '../../ui/resizeHandles.js';
import canvasContext from '../../ui/canvasContext.js';
import cellMain from '../../ui/cellMain.js';

export default function documentMouseup() {
    //表格mouseup
    onNS(document, "mouseup.luckysheetEvent", null, function(event) {
        if (luckysheetConfigsetting && luckysheetConfigsetting.hook && luckysheetConfigsetting.hook.sheetMouseup) {
            let mouse = mouseposition(event.pageX, event.pageY);
            let scroll = getScrollPosition();
            let x = mouse[0] + scroll.scrollLeft;
            let y = mouse[1] + scroll.scrollTop;

            let row_location = rowLocation(y),
                row = row_location[1],
                row_pre = row_location[0],
                row_index = row_location[2];
            let col_location = colLocation(x),
                col = col_location[1],
                col_pre = col_location[0],
                col_index = col_location[2];

            let margeset = menuButton.mergeborer(Store.sheetData, row_index, col_index);
            if (margeset) {
                row = margeset.row[1];
                row_pre = margeset.row[0];
                row_index = margeset.row[2];

                col = margeset.column[1];
                col_pre = margeset.column[0];
                col_index = margeset.column[2];
            }

            // if(Store.sheetData[row_index] && Store.sheetData[row_index][col_index]){
            let sheetFile = sheetmanage.getSheetByIndex();

            let moveState = {
                functionResizeStatus: formula.functionResizeStatus,
                horizontalmoveState: !!luckysheetFreezen.horizontalmovestate,
                verticalmoveState: !!luckysheetFreezen.verticalmovestate,
                sheetMoveStatus: Store.luckysheet_sheet_move_status,
                scrollStatus: !!Store.luckysheet_scroll_status,
                selectStatus: !!Store.luckysheet_select_status,
                rowsSelectedStatus: !!Store.luckysheet_rows_selected_status,
                colsSelectedStatus: !!Store.luckysheet_cols_selected_status,
                cellSelectedMove: !!Store.luckysheet_cell_selected_move,
                cellSelectedExtend: !!Store.luckysheet_cell_selected_extend,
                colsChangeSize: !!Store.luckysheet_cols_change_size,
                rowsChangeSize: !!Store.luckysheet_rows_change_size,
                rangeResize: !!formula.rangeResize,
                rangeMove: !!formula.rangeMove,
            };

            let luckysheetTableContent = canvasContext.getContext();

            method.createHookFunction(
                "sheetMouseup",
                Store.sheetData[row_index][col_index],
                {
                    r: row_index,
                    c: col_index,
                    start_r: row_pre,
                    start_c: col_pre,
                    end_r: row,
                    end_c: col,
                },
                sheetFile,
                moveState,
                luckysheetTableContent,
            );
            // }
        }

        //数据窗格主体
        if (Store.luckysheet_select_status) {
            clearTimeout(Store.countfuncTimeout);
            Store.countfuncTimeout = setTimeout(function() {
                countfunc();
            }, 0);

            //格式刷
            if (menuButton.luckysheetPaintModelOn) {
                selection.pasteHandlerOfPaintModel(Store.luckysheet_copy_save);

                if (menuButton.luckysheetPaintSingle) {
                    //单次 格式刷
                    menuButton.cancelPaintModel();
                }
            }
        }

        Store.luckysheet_select_status = false;
        window.cancelAnimationFrame(Store.jfautoscrollTimeout);
        Store.luckysheet_scroll_status = false;

        const _cellSelected = document.getElementById("luckysheet-cell-selected");
        if (_cellSelected) {
            const _fillHandle = _cellSelected.querySelector(".luckysheet-cs-fillhandle");
            if (_fillHandle) _fillHandle.style.cursor = "crosshair";
            const _dragHandle = _cellSelected.querySelector(".luckysheet-cs-draghandle");
            if (_dragHandle) _dragHandle.style.cursor = "move";
        }
        cellMain.setCursorDefault();

        //行标题窗格主体
        Store.luckysheet_rows_selected_status = false;

        //列标题窗格主体
        Store.luckysheet_cols_selected_status = false;

        Store.luckysheet_model_move_state = false;

        if (formula.functionResizeStatus) {
            formula.functionResizeStatus = false;
            const _calcSize = document.getElementById("luckysheet-wa-calculate-size"); if (_calcSize) _calcSize.removeAttribute("style");
        }

        if (luckysheetFreezen.horizontalmovestate) {
            luckysheetFreezen.horizontalmovestate = false;
            const _freezeHBar = document.getElementById("luckysheet-freezebar-horizontal");
            if (_freezeHBar) _freezeHBar.classList.remove("luckysheet-freezebar-active");
            const _freezeHHandle = _freezeHBar ? _freezeHBar.querySelector(".luckysheet-freezebar-horizontal-handle") : null;
            if (_freezeHHandle) _freezeHHandle.style.cursor = "-webkit-grab";
            if (luckysheetFreezen.freezenhorizontaldata[4] <= Store.columnHeaderHeight) {
                luckysheetFreezen.cancelFreezenHorizontal();
            }
            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
        }

        if (luckysheetFreezen.verticalmovestate) {
            luckysheetFreezen.verticalmovestate = false;
            const _freezeVBar = document.getElementById("luckysheet-freezebar-vertical");
            if (_freezeVBar) _freezeVBar.classList.remove("luckysheet-freezebar-active");
            const _freezeVHandle = _freezeVBar ? _freezeVBar.querySelector(".luckysheet-freezebar-vertical-handle") : null;
            if (_freezeVHandle) _freezeVHandle.style.cursor = "-webkit-grab";
            if (luckysheetFreezen.freezenverticaldata[4] <= Store.rowHeaderWidth) {
                luckysheetFreezen.cancelFreezenVertical();
            }
            luckysheetFreezen.createAssistCanvas();
            luckysheetrefreshgrid();
        }


        if (Store.luckysheet_sheet_move_status) {
            Store.luckysheet_sheet_move_status = false;
            const _sheetClone = document.getElementById("luckysheet-sheets-item-clone");
            if (Store.luckysheet_sheet_move_data.activeobject && _sheetClone) _sheetClone.before(Store.luckysheet_sheet_move_data.activeobject);
            if (Store.luckysheet_sheet_move_data.activeobject) Store.luckysheet_sheet_move_data.activeobject.removeAttribute("style");
            if (_sheetClone) _sheetClone.remove();
            if (Store.luckysheet_sheet_move_data.cursorobject) Store.luckysheet_sheet_move_data.cursorobject.style.cursor = "pointer";
            Store.luckysheet_sheet_move_data = {};
            sheetmanage.reOrderAllSheet();
        }

        if (formula.rangeResize) {
            formula.rangeResizeDragged(
                event,
                formula.rangeResizeObj,
                formula.rangeResize,
                formula.rangeResizexy,
                formula.rangeResizeWinW,
                formula.rangeResizeWinH,
            );
        }

        //image move
        if (imageCtrl.move) {
            imageCtrl.moveImgItem();
        }

        //image resize
        if (imageCtrl.resize) {
            imageCtrl.resizeImgItem();
        }

        //image cropChange
        if (imageCtrl.cropChange) {
            imageCtrl.cropChangeImgItem();
        }

        //批注框 移动
        if (luckysheetPostil.move) {
            luckysheetPostil.move = false;

            let ps_id = luckysheetPostil.currentObj.closest(".luckysheet-postil-show")?.id;

            if (!ps_id) {
                luckysheetPostil.move = false;
                return;
            }

            let ps_r = ps_id.split("luckysheet-postil-show_")[1].split("_")[0];
            let ps_c = ps_id.split("luckysheet-postil-show_")[1].split("_")[1];

            let d = editor.deepCopyFlowData(Store.sheetData);
            let rc = [];

            d[ps_r][ps_c].ps.left = luckysheetPostil.currentObj.offsetLeft;
            d[ps_r][ps_c].ps.top = luckysheetPostil.currentObj.offsetTop;
            d[ps_r][ps_c].ps.value = luckysheetPostil.currentObj
                .querySelector(".formulaInputFocus")
                .innerHTML
                .replaceAll("<div>", "\n")
                .replaceAll(/<(.*)>.*?|<(.*) \/>/g, "")
                .trim();

            rc.push(ps_r + "_" + ps_c);

            luckysheetPostil.ref(d, rc);

            const _psEl = document.getElementById(ps_id); if (_psEl) _psEl.remove();

            if (d[ps_r][ps_c].ps.isshow) {
                luckysheetPostil.buildPs(ps_r, ps_c, d[ps_r][ps_c].ps);
                const _psEl2 = document.getElementById(ps_id);
                if (_psEl2) _psEl2.classList.add("luckysheet-postil-show-active");
                const _resizeEl = _psEl2 ? _psEl2.querySelector(".luckysheet-postil-dialog-resize") : null;
                if (_resizeEl) _resizeEl.style.display = 'block';
            } else {
                luckysheetPostil.editPs(ps_r, ps_c);
            }
        }

        //批注框 改变大小
        if (luckysheetPostil.resize) {
            luckysheetPostil.resize = null;

            let ps_id2 = luckysheetPostil.currentObj.closest(".luckysheet-postil-show")?.id;

            if (!ps_id2) {
                luckysheetPostil.resize = null;
                return;
            }

            let ps_r = ps_id2.split("luckysheet-postil-show_")[1].split("_")[0];
            let ps_c = ps_id2.split("luckysheet-postil-show_")[1].split("_")[1];

            let d = editor.deepCopyFlowData(Store.sheetData);
            let rc = [];

            d[ps_r][ps_c].ps.left = luckysheetPostil.currentObj.offsetLeft;
            d[ps_r][ps_c].ps.top = luckysheetPostil.currentObj.offsetTop;
            d[ps_r][ps_c].ps.width = luckysheetPostil.currentObj.offsetWidth;
            d[ps_r][ps_c].ps.height = luckysheetPostil.currentObj.offsetHeight;
            d[ps_r][ps_c].ps.value = luckysheetPostil.currentObj
                .querySelector(".formulaInputFocus")
                .innerHTML
                .replaceAll("<div>", "\n")
                .replaceAll(/<(.*)>.*?|<(.*) \/>/g, "")
                .trim();

            rc.push(ps_r + "_" + ps_c);

            luckysheetPostil.ref(d, rc);

            const _psEl3 = document.getElementById(ps_id); if (_psEl3) _psEl3.remove();

            if (d[ps_r][ps_c].ps.isshow) {
                luckysheetPostil.buildPs(ps_r, ps_c, d[ps_r][ps_c].ps);
                const _psEl4 = document.getElementById(ps_id);
                if (_psEl4) _psEl4.classList.add("luckysheet-postil-show-active");
                const _resizeEl2 = _psEl4 ? _psEl4.querySelector(".luckysheet-postil-dialog-resize") : null;
                if (_resizeEl2) _resizeEl2.style.display = 'block';
            } else {
                luckysheetPostil.editPs(ps_r, ps_c);
            }
        }

        //改变行高
        if (Store.luckysheet_rows_change_size) {
            Store.luckysheet_rows_change_size = false;

            resizeHandles.changeSizeLine.hide();
            resizeHandles.rowChangeSize.setCss({opacity: 0});
            rowHeader.setCursor("default");

            let mouse = mouseposition(event.pageX, event.pageY);
            let scrollTop = rowHeader.getScrollTop();
            let y = mouse[1] + scrollTop;
            let winH = document.documentElement.clientHeight;

            let row_location = rowLocation(y),
                row = row_location[1],
                row_pre = row_location[0],
                row_index = row_location[2];

            let size = y + 3 - Store.luckysheet_rows_change_size_start[0];

            if (y + 3 - Store.luckysheet_rows_change_size_start[0] < 19) {
                size = 19;
            }

            if (y >= winH - 200 + scrollTop) {
                size = winH - 200 - Store.luckysheet_rows_change_size_start[0] + scrollTop;
            }

            let cfg = structuredClone(Store.config);
            if (cfg["rowlen"] == null) {
                cfg["rowlen"] = {};
            }

            if (cfg["customHeight"] == null) {
                cfg["customHeight"] = {};
            }

            cfg["customHeight"][Store.luckysheet_rows_change_size_start[1]] = 1;

            const changeRowIndex = Store.luckysheet_rows_change_size_start[1];
            let changeRowSelected = false;
            if (Store["luckysheet_select_save"].length > 0) {
                Store["luckysheet_select_save"]
                    .filter((select) => select.row_select)
                    .some((select) => {
                        if (changeRowIndex >= select.row[0] && changeRowIndex <= select.row[1]) {
                            changeRowSelected = true;
                        }
                        return changeRowSelected;
                    });
            }
            if (changeRowSelected) {
                Store["luckysheet_select_save"]
                    .filter((select) => select.row_select)
                    .forEach((select) => {
                        for (let r = select.row[0]; r <= select.row[1]; r++) {
                            cfg["rowlen"][r] = Math.ceil(size / Store.zoomRatio);
                        }
                    });
            } else {
                cfg["rowlen"][Store.luckysheet_rows_change_size_start[1]] = Math.ceil(size / Store.zoomRatio);
            }

            let images = imageCtrl.moveChangeSize("row", Store.luckysheet_rows_change_size_start[1], size);

            if (Store.clearjfundo) {
                Store.jfundo.length = 0;

                Store.jfredo.push({
                    type: "resize",
                    ctrlType: "resizeR",
                    sheetIndex: Store.currentSheetIndex,
                    config: structuredClone(Store.config),
                    curconfig: structuredClone(cfg),
                    images: structuredClone(imageCtrl.images),
                    curImages: structuredClone(images),
                });
            }

            //config
            Store.config = cfg;
            syncConfigToStore();


            //images
            getCurrentFile().images = images;
            imageCtrl.images = images;
            imageCtrl.allImagesShow();

            let _dataSize = getDataSize();
            jfrefreshgrid_rhcw(_dataSize.rowCount, null);
        }

        //改变列宽
        if (Store.luckysheet_cols_change_size) {
            Store.luckysheet_cols_change_size = false;
            resizeHandles.changeSizeLine.hide();
            resizeHandles.colChangeSize.setCss({opacity: 0});
            colHeader.setCursor("default");

            let mouse = mouseposition(event.pageX, event.pageY);
            let scrollLeft = colHeader.getScrollLeft();
            let x = mouse[0] + scrollLeft;
            let winW = document.documentElement.clientWidth;

            let row_index = getMaxRowIndex(),
                row = Store.visibleRowPositions[row_index],
                row_pre = 0;
            let col_location = colLocation(x),
                col = col_location[1],
                col_pre = col_location[0],
                col_index = col_location[2];
            let size = x + 3 - Store.luckysheet_cols_change_size_start[0];

            let firstcolumnlen = Store.defaultcollen;
            if (
                Store.config["columnlen"] != null &&
                Store.config["columnlen"][Store.luckysheet_cols_change_size_start[1]] != null
            ) {
                firstcolumnlen = Store.config["columnlen"][Store.luckysheet_cols_change_size_start[1]];
            }

            if (Math.abs(size - firstcolumnlen) < 3) {
                return;
            }
            if (x + 3 - Store.luckysheet_cols_change_size_start[0] < 30) {
                size = 30;
            }

            if (x >= winW - 100 + scrollLeft) {
                size = winW - 100 - Store.luckysheet_cols_change_size_start[0] + scrollLeft;
            }

            let cfg = structuredClone(Store.config);
            if (cfg["columnlen"] == null) {
                cfg["columnlen"] = {};
            }

            if (cfg["customWidth"] == null) {
                cfg["customWidth"] = {};
            }

            cfg["customWidth"][Store.luckysheet_cols_change_size_start[1]] = 1;

            const changeColumnIndex = Store.luckysheet_cols_change_size_start[1];
            let changeColumnSelected = false;
            if (Store["luckysheet_select_save"].length > 0) {
                Store["luckysheet_select_save"]
                    .filter((select) => select.column_select)
                    .some((select) => {
                        if (changeColumnIndex >= select.column[0] && changeColumnIndex <= select.column[1]) {
                            changeColumnSelected = true;
                        }
                        return changeColumnSelected;
                    });
            }
            if (changeColumnSelected) {
                Store["luckysheet_select_save"]
                    .filter((select) => select.column_select)
                    .forEach((select) => {
                        for (let r = select.column[0]; r <= select.column[1]; r++) {
                            cfg["columnlen"][r] = Math.ceil(size / Store.zoomRatio);
                        }
                    });
            } else {
                cfg["columnlen"][Store.luckysheet_cols_change_size_start[1]] = Math.ceil(size / Store.zoomRatio);
            }

            let images = imageCtrl.moveChangeSize("column", Store.luckysheet_cols_change_size_start[1], size);

            if (Store.clearjfundo) {
                Store.jfundo.length = 0;

                Store.jfredo.push({
                    type: "resize",
                    ctrlType: "resizeC",
                    sheetIndex: Store.currentSheetIndex,
                    config: structuredClone(Store.config),
                    curconfig: structuredClone(cfg),
                    images: structuredClone(imageCtrl.images),
                    curImages: structuredClone(images),
                });
            }

            //config
            Store.config = cfg;
            syncConfigToStore();


            //images
            getCurrentFile().images = images;
            imageCtrl.images = images;
            imageCtrl.allImagesShow();

            let _dataSize2 = getDataSize();
            jfrefreshgrid_rhcw(null, _dataSize2.colCount);

            setTimeout(function() {
                luckysheetrefreshgrid();
            }, 1);
        }

        if (formula.rangeMove) {
            formula.rangeMoveDragged(formula.rangeMoveObj);
        }

        //改变选择框的位置并替换目标单元格
        if (Store.luckysheet_cell_selected_move) {
            const _elMoveHide1 = document.getElementById("luckysheet-cell-selected-move"); if (_elMoveHide1) _elMoveHide1.style.display = 'none';

            Store.luckysheet_cell_selected_move = false;
            let mouse = mouseposition(event.pageX, event.pageY);


            let scroll = getScrollPosition();
            let scrollLeft = scroll.scrollLeft;
            let scrollTop = scroll.scrollTop;

            let x = mouse[0] + scrollLeft;
            let y = mouse[1] + scrollTop;

            let winH = document.documentElement.clientHeight + scrollTop - Store.sheetBarHeight - Store.statisticBarHeight,
                winW = document.documentElement.clientWidth + scrollLeft;

            let row_index = rowLocation(y)[2];
            let col_index = colLocation(x)[2];

            let row_index_original = Store.luckysheet_cell_selected_move_index[0],
                col_index_original = Store.luckysheet_cell_selected_move_index[1];

            if (row_index == row_index_original && col_index == col_index_original) {
                return;
            }

            let d = editor.deepCopyFlowData(Store.sheetData);
            let last = getLastSelection();

            let data = getdatabyselection(last);

            let cfg = structuredClone(Store.config);
            if (cfg["merge"] == null) {
                cfg["merge"] = {};
            }
            if (cfg["rowlen"] == null) {
                cfg["rowlen"] = {};
            }

            //选区包含部分单元格
            if (hasPartMC(cfg, last["row"][0], last["row"][1], last["column"][0], last["column"][1])) {
                if (isEditMode()) {
                    alert(context.locale_drag.noMerge);
                } else {
                    tooltip.info('<i class="fa fa-exclamation-triangle"></i>', context.locale_drag.noMerge);
                }
                return;
            }

            let row_s = last["row"][0] - row_index_original + row_index,
                row_e = last["row"][1] - row_index_original + row_index;
            let col_s = last["column"][0] - col_index_original + col_index,
                col_e = last["column"][1] - col_index_original + col_index;

            if (row_s < 0 || y < 0) {
                row_s = 0;
                row_e = last["row"][1] - last["row"][0];
            }

            if (col_s < 0 || x < 0) {
                col_s = 0;
                col_e = last["column"][1] - last["column"][0];
            }

            if (row_e >= Store.visibleRowPositions[getMaxRowIndex()] || y > winH) {
                row_s = getMaxRowIndex() - last["row"][1] + last["row"][0];
                row_e = getMaxRowIndex();
            }

            if (col_e >= Store.visibleColPositions[getMaxColIndex()] || x > winW) {
                col_s = getMaxColIndex() - last["column"][1] + last["column"][0];
                col_e = getMaxColIndex();
            }

            //替换的位置包含部分单元格
            if (hasPartMC(cfg, row_s, row_e, col_s, col_e)) {
                if (isEditMode()) {
                    alert(context.locale_drag.noMerge);
                } else {
                    tooltip.info('<i class="fa fa-exclamation-triangle"></i>', context.locale_drag.noMerge);
                }
                return;
            }

            let borderInfoCompute = getBorderInfoCompute(Store.currentSheetIndex);

            //删除原本位置的数据
            let RowlChange = null;
            for (let r = last["row"][0]; r <= last["row"][1]; r++) {
                if (r in cfg["rowlen"]) {
                    RowlChange = true;
                }

                for (let c = last["column"][0]; c <= last["column"][1]; c++) {
                    let cell = d[r][c];

                    if (getObjType(cell) == "object" && "mc" in cell) {
                        if (cell["mc"].r + "_" + cell["mc"].c in cfg["merge"]) {
                            delete cfg["merge"][cell["mc"].r + "_" + cell["mc"].c];
                        }
                    }

                    d[r][c] = null;
                }
            }

            //边框
            if (cfg["borderInfo"] && cfg["borderInfo"].length > 0) {
                let borderInfo = [];

                for (let i = 0; i < cfg["borderInfo"].length; i++) {
                    let bd_rangeType = cfg["borderInfo"][i].rangeType;

                    if (bd_rangeType == "range") {
                        let bd_range = cfg["borderInfo"][i].range;
                        let bd_emptyRange = [];

                        for (let j = 0; j < bd_range.length; j++) {
                            bd_emptyRange = bd_emptyRange.concat(
                                conditionformat.CFSplitRange(
                                    bd_range[j],
                                    { row: last["row"], column: last["column"] },
                                    { row: [row_s, row_e], column: [col_s, col_e] },
                                    "restPart",
                                ),
                            );
                        }

                        cfg["borderInfo"][i].range = bd_emptyRange;

                        borderInfo.push(cfg["borderInfo"][i]);
                    } else if (bd_rangeType == "cell") {
                        let bd_r = cfg["borderInfo"][i].value.row_index;
                        let bd_c = cfg["borderInfo"][i].value.col_index;

                        if (
                            !(
                                bd_r >= last["row"][0] &&
                                bd_r <= last["row"][1] &&
                                bd_c >= last["column"][0] &&
                                bd_c <= last["column"][1]
                            )
                        ) {
                            borderInfo.push(cfg["borderInfo"][i]);
                        }
                    }
                }

                cfg["borderInfo"] = borderInfo;
            }
            //替换位置数据更新
            let offsetMC = {};
            for (let r = 0; r < data.length; r++) {
                for (let c = 0; c < data[0].length; c++) {
                    if (borderInfoCompute[r + last["row"][0] + "_" + (c + last["column"][0])]) {
                        let bd_obj = {
                            rangeType: "cell",
                            value: {
                                row_index: r + row_s,
                                col_index: c + col_s,
                                l: borderInfoCompute[r + last["row"][0] + "_" + (c + last["column"][0])].l,
                                r: borderInfoCompute[r + last["row"][0] + "_" + (c + last["column"][0])].r,
                                t: borderInfoCompute[r + last["row"][0] + "_" + (c + last["column"][0])].t,
                                b: borderInfoCompute[r + last["row"][0] + "_" + (c + last["column"][0])].b,
                            },
                        };

                        if (cfg["borderInfo"] == null) {
                            cfg["borderInfo"] = [];
                        }

                        cfg["borderInfo"].push(bd_obj);
                    }

                    let value = "";
                    if (data[r] != null && data[r][c] != null) {
                        value = data[r][c];
                    }

                    if (getObjType(value) == "object" && "mc" in value) {
                        let mc = structuredClone(value["mc"]);
                        if ("rs" in value["mc"]) {
                            offsetMC[mc.r + "_" + mc.c] = [r + row_s, c + col_s];

                            value["mc"].r = r + row_s;
                            value["mc"].c = c + col_s;

                            cfg["merge"][r + row_s + "_" + (c + col_s)] = value["mc"];
                        } else {
                            value["mc"].r = offsetMC[mc.r + "_" + mc.c][0];
                            value["mc"].c = offsetMC[mc.r + "_" + mc.c][1];
                        }
                    }
                    d[r + row_s][c + col_s] = value;
                }
            }

            if (RowlChange) {
                cfg = rowlenByRange(d, last["row"][0], last["row"][1], cfg);
                cfg = rowlenByRange(d, row_s, row_e, cfg);
            }

            //条件格式
            let cdformat = structuredClone(getCurrentFile()["luckysheet_conditionformat_save"]);
            if (cdformat != null && cdformat.length > 0) {
                for (let i = 0; i < cdformat.length; i++) {
                    let cdformat_cellrange = cdformat[i].cellrange;
                    let emptyRange = [];
                    for (let j = 0; j < cdformat_cellrange.length; j++) {
                        let range = conditionformat.CFSplitRange(
                            cdformat_cellrange[j],
                            { row: last["row"], column: last["column"] },
                            { row: [row_s, row_e], column: [col_s, col_e] },
                            "allPart",
                        );
                        emptyRange = emptyRange.concat(range);
                    }
                    cdformat[i].cellrange = emptyRange;
                }
            }

            let rf;
            if (Store.selections[0].row_focus == Store.selections[0].row[0]) {
                rf = row_s;
            } else {
                rf = row_e;
            }

            let cf;
            if (Store.selections[0].column_focus == Store.selections[0].column[0]) {
                cf = col_s;
            } else {
                cf = col_e;
            }

            let range = [];
            range.push({ row: last["row"], column: last["column"] });
            range.push({ row: [row_s, row_e], column: [col_s, col_e] });

            last["row"] = [row_s, row_e];
            last["column"] = [col_s, col_e];
            last["row_focus"] = rf;
            last["column_focus"] = cf;

            let allParam = {
                cfg: cfg,
                RowlChange: RowlChange,
                cdformat: cdformat,
            };

            jfrefreshgrid(d, range, allParam);

            selectHightlightShow();

            const _sheetTable = document.getElementById("luckysheet-sheet-table"); if (_sheetTable) _sheetTable.style.cursor = "default";
            clearTimeout(Store.countfuncTimeout);
            Store.countfuncTimeout = setTimeout(function() {
                countfunc();
            }, 500);
        }

        //选区下拉
        if (Store.luckysheet_cell_selected_extend) {
            Store.luckysheet_cell_selected_extend = false;
            const _elExtendHide = document.getElementById("luckysheet-cell-selected-extend"); if (_elExtendHide) _elExtendHide.style.display = 'none';


            let mouse = mouseposition(event.pageX, event.pageY);
            let scroll = getScrollPosition();
            let scrollLeft = scroll.scrollLeft;
            let scrollTop = scroll.scrollTop;

            let x = mouse[0] + scrollLeft - 5;
            let y = mouse[1] + scrollTop - 5;

            let winH = document.documentElement.clientHeight + scrollTop - Store.sheetBarHeight - Store.statisticBarHeight,
                winW = document.documentElement.clientWidth + scrollLeft;

            let row_location = rowLocation(y),
                row = row_location[1],
                row_pre = row_location[0],
                row_index = row_location[2];
            let col_location = colLocation(x),
                col = col_location[1],
                col_pre = col_location[0],
                col_index = col_location[2];

            let row_index_original = Store.luckysheet_cell_selected_extend_index[0],
                col_index_original = Store.luckysheet_cell_selected_extend_index[1];

            let last = getLastSelection();
            let row_s = last["row"][0],
                row_e = last["row"][1];
            let col_s = last["column"][0],
                col_e = last["column"][1];

            if (row_s < 0 || y < 0) {
                row_s = 0;
                row_e = last["row"][1] - last["row"][0];
            }

            if (col_s < 0 || x < 0) {
                col_s = 0;
                col_e = last["column"][1] - last["column"][0];
            }

            if (row_e >= Store.visibleRowPositions[getMaxRowIndex()] || y > winH) {
                row_s = getMaxRowIndex() - last["row"][1] + last["row"][0];
                row_e = getMaxRowIndex();
            }

            if (col_e >= Store.visibleColPositions[getMaxColIndex()] || x > winW) {
                col_s = getMaxColIndex() - last["column"][1] + last["column"][0];
                col_e = getMaxColIndex();
            }

            //复制范围
            luckysheetDropCell.copyRange = {
                row: structuredClone(last["row"]),
                column: structuredClone(last["column"]),
            };
            //applyType
            let typeItemHide = luckysheetDropCell.typeItemHide();

            if (
                !typeItemHide[0] &&
                !typeItemHide[1] &&
                !typeItemHide[2] &&
                !typeItemHide[3] &&
                !typeItemHide[4] &&
                !typeItemHide[5] &&
                !typeItemHide[6]
            ) {
                luckysheetDropCell.applyType = "0";
            } else {
                luckysheetDropCell.applyType = "1";
            }

            if (Math.abs(row_index_original - row_index) > Math.abs(col_index_original - col_index)) {
                if (!(row_index >= row_s && row_index <= row_e)) {
                    if (Store.selections[0].top_move >= row_pre) {
                        //当往上拖拽时
                        luckysheetDropCell.applyRange = {
                            row: [row_index, last["row"][0] - 1],
                            column: last["column"],
                        };
                        luckysheetDropCell.direction = "up";

                        row_s -= last["row"][0] - row_index;

                        //是否有数据透视表范围
                    } else {
                        //当往下拖拽时
                        luckysheetDropCell.applyRange = {
                            row: [last["row"][1] + 1, row_index],
                            column: last["column"],
                        };
                        luckysheetDropCell.direction = "down";

                        row_e += row_index - last["row"][1];

                        //是否有数据透视表范围
                    }
                } else {
                    return;
                }
            } else {
                if (!(col_index >= col_s && col_index <= col_e)) {
                    if (Store.selections[0].left_move >= col_pre) {
                        //当往左拖拽时
                        luckysheetDropCell.applyRange = {
                            row: last["row"],
                            column: [col_index, last["column"][0] - 1],
                        };
                        luckysheetDropCell.direction = "left";

                        col_s -= last["column"][0] - col_index;

                        //是否有数据透视表范围
                    } else {
                        //当往右拖拽时
                        luckysheetDropCell.applyRange = {
                            row: last["row"],
                            column: [last["column"][1] + 1, col_index],
                        };
                        luckysheetDropCell.direction = "right";

                        col_e += col_index - last["column"][1];

                        //是否有数据透视表范围
                    }
                } else {
                    return;
                }
            }

            if (Store.config["merge"] != null) {
                let hasMc = false;

                for (let r = last["row"][0]; r <= last["row"][1]; r++) {
                    for (let c = last["column"][0]; c <= last["column"][1]; c++) {
                        let cell = Store.sheetData[r][c];

                        if (cell != null && cell.mc != null) {
                            hasMc = true;
                            break;
                        }
                    }
                }

                if (hasMc) {
                    if (isEditMode()) {
                        alert(context.locale_drag.noMerge);
                    } else {
                        tooltip.info(context.locale_drag.noMerge, "");
                    }

                    return;
                }

                for (let r = row_s; r <= row_e; r++) {
                    for (let c = col_s; c <= col_e; c++) {
                        let cell = Store.sheetData[r][c];

                        if (cell != null && cell.mc != null) {
                            hasMc = true;
                            break;
                        }
                    }
                }

                if (hasMc) {
                    if (isEditMode()) {
                        alert(context.locale_drag.noMerge);
                    } else {
                        tooltip.info(context.locale_drag.noMerge, "");
                    }

                    return;
                }
            }

            last["row"] = [row_s, row_e];
            last["column"] = [col_s, col_e];

            luckysheetDropCell.update();
            luckysheetDropCell.createIcon();

            const _elMoveHide2 = document.getElementById("luckysheet-cell-selected-move"); if (_elMoveHide2) _elMoveHide2.style.display = 'none';

            const _sheetTable2 = document.getElementById("luckysheet-sheet-table"); if (_sheetTable2) _sheetTable2.style.cursor = "default";
            clearTimeout(Store.countfuncTimeout);
            Store.countfuncTimeout = setTimeout(function() {
                countfunc();
            }, 500);
        }
    });
}
