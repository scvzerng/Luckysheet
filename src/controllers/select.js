import menuButton from './menuButton';
import formula from '../global/formula';
import { dynamicArrayHightShow } from '../global/dynamicArray';
import { rowLocationByIndex, colLocationByIndex } from '../global/location';
import browser from '../global/browser';
import { getRangetxt } from '../methods/get';
import { getCurrentFile, getLastSelection, getFocusCell } from '../utils/storeAccess.js';
import Store from '../store';
import method from '../global/method';
import locale from '../locale/locale';
import { refreshMenuButtonFocus } from "../global/api";
import selectionCopy from '../ui/selectionCopy.js';
import cellSelectedFocus from '../ui/cellSelectedFocus.js';
import cellMain from '../ui/cellMain.js';
import countShow from '../ui/countShow.js';

function seletedHighlistByindex(id, r1, r2, c1, c2) {
    let row = Store.visibledatarow[r2],
        row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
    let col = Store.visibleColPositions[c2],
        col_pre = c1 - 1 == -1 ? 0 : Store.visibleColPositions[c1 - 1];

    let _el = document.getElementById(id);
    if (_el) {
        Object.assign(_el.style, {
            "left": col_pre + "px",
            "width": (col - col_pre - 1) + "px",
            "top": row_pre + "px",
            "height": (row - row_pre - 1) + "px"
        });
    }
}

function selectHightlightShow(isRestore = false) {
    const _elSelBoxs2 = document.getElementById("luckysheet-cell-selected-boxs"); if (_elSelBoxs2) _elSelBoxs2.style.display = '';
    let _elCellSelected = document.querySelector("#luckysheet-cell-selected-boxs #luckysheet-cell-selected");
    if (_elCellSelected) {
        Array.from(_elCellSelected.parentElement.children).filter(s => s !== _elCellSelected && s.classList.contains("luckysheet-cell-selected")).forEach(el => el.remove());
    }

    if (Store.selections.length > 0) {
        for (let i = 0; i < Store.selections.length; i++) {
            let r1 = Store.selections[i].row[0],
                r2 = Store.selections[i].row[1];
            let c1 = Store.selections[i].column[0],
                c2 = Store.selections[i].column[1];

            let rf, cf;
            if (Store.selections[i].row_focus == null) {
                rf = r1;
            }
            else {
                rf = Store.selections[i].row_focus;
            }

            if (Store.selections[i].column_focus == null) {
                cf = c1;
            }
            else {
                cf = Store.selections[i].column_focus;
            }

            let row = Store.visibledatarow[r2],
                row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
            let col = Store.visibleColPositions[c2],
                col_pre = c1 - 1 == -1 ? 0 : Store.visibleColPositions[c1 - 1];

            let row_f = Store.visibledatarow[rf],
                row_pre_f = rf - 1 == -1 ? 0 : Store.visibledatarow[rf - 1];
            let col_f = Store.visibleColPositions[cf],
                col_pre_f = cf - 1 == -1 ? 0 : Store.visibleColPositions[cf - 1];

            let margeset = menuButton.mergeborer(Store.sheetData, rf, cf);
            if (margeset) {
                row_f = margeset.row[1];
                row_pre_f = margeset.row[0];

                col_f = margeset.column[1];
                col_pre_f = margeset.column[0];
            }

            Store.selections[i]["row"] = [r1, r2];
            Store.selections[i]["column"] = [c1, c2];

            Store.selections[i]["row_focus"] = rf;
            Store.selections[i]["column_focus"] = cf;

            Store.selections[i]["left"] = col_pre_f;
            Store.selections[i]["width"] = col_f - col_pre_f - 1;
            Store.selections[i]["top"] = row_pre_f;
            Store.selections[i]["height"] = row_f - row_pre_f - 1;

            Store.selections[i]["left_move"] = col_pre;
            Store.selections[i]["width_move"] = col - col_pre - 1;
            Store.selections[i]["top_move"] = row_pre;
            Store.selections[i]["height_move"] = row - row_pre - 1;

            if (i == 0) {
                _elCellSelected = document.querySelector("#luckysheet-cell-selected-boxs #luckysheet-cell-selected");
                if (_elCellSelected) {
                    if (Store.selections.length == 1) {
                        if (browser.mobilecheck()) {
                            Object.assign(_elCellSelected.style, {
                                "left": Store.selections[i]["left_move"] + "px",
                                "width": Store.selections[i]["width_move"] + "px",
                                "top": Store.selections[i]["top_move"] + "px",
                                "height": Store.selections[i]["height_move"] + "px",
                                "display": "block",
                                "border": "1px solid #0188fb"
                            });
                            let _elDraghandle = _elCellSelected.querySelector(".luckysheet-cs-draghandle");
                            if (_elDraghandle) _elDraghandle.style.display = "block";
                            let _elFillhandle = _elCellSelected.querySelector(".luckysheet-cs-fillhandle");
                            if (_elFillhandle) _elFillhandle.style.display = "none";
                            let _elTouchhandle = _elCellSelected.querySelector(".luckysheet-cs-touchhandle");
                            if (_elTouchhandle) _elTouchhandle.style.display = "block";
                        }
                        else {
                            Object.assign(_elCellSelected.style, {
                                "left": Store.selections[i]["left_move"] + "px",
                                "width": Store.selections[i]["width_move"] + "px",
                                "top": Store.selections[i]["top_move"] + "px",
                                "height": Store.selections[i]["height_move"] + "px",
                                "display": "block",
                                "border": "1px solid #0188fb"
                            });
                            let _elDraghandle = _elCellSelected.querySelector(".luckysheet-cs-draghandle");
                            if (_elDraghandle) _elDraghandle.style.display = "block";
                            let _elFillhandle = _elCellSelected.querySelector(".luckysheet-cs-fillhandle");
                            if (_elFillhandle) _elFillhandle.style.display = "block";
                            let _elTouchhandle = _elCellSelected.querySelector(".luckysheet-cs-touchhandle");
                            if (_elTouchhandle) _elTouchhandle.style.display = "none";
                        }
                    }
                    else {
                        Object.assign(_elCellSelected.style, {
                            "left": Store.selections[i]["left_move"] + "px",
                            "width": Store.selections[i]["width_move"] + "px",
                            "top": Store.selections[i]["top_move"] + "px",
                            "height": Store.selections[i]["height_move"] + "px",
                            "display": "block",
                            "border": "1px solid rgba(1, 136, 251, 0.15)"
                        });
                        let _elDraghandle = _elCellSelected.querySelector(".luckysheet-cs-draghandle");
                        if (_elDraghandle) _elDraghandle.style.display = "none";
                        let _elFillhandle = _elCellSelected.querySelector(".luckysheet-cs-fillhandle");
                        if (_elFillhandle) _elFillhandle.style.display = "none";
                    }
                }
            }
            else {
                let _elSelBoxs = document.getElementById("luckysheet-cell-selected-boxs");
                if (_elSelBoxs) {
                    _elSelBoxs.insertAdjacentHTML('beforeend', '<div class="luckysheet-cell-selected" style="left: ' + Store.selections[i]["left_move"] + 'px; width: ' + Store.selections[i]["width_move"] + 'px; top: ' + Store.selections[i]["top_move"] + 'px; height: ' + Store.selections[i]["height_move"] + 'px; border: 1px solid rgba(1, 136, 251, 0.15); display: block;"></div>');
                }
            }

            if (i == Store.selections.length - 1) {
                cellSelectedFocus.setCss({
                    "left": Store.selections[i]["left"],
                    "width": Store.selections[i]["width"],
                    "top": Store.selections[i]["top"],
                    "height": Store.selections[i]["height"],
                    "display": "block"
                });
                luckysheet_count_show(
                    Store.selections[i]["left_move"],
                    Store.selections[i]["top_move"],
                    Store.selections[i]["width_move"],
                    Store.selections[i]["height_move"],
                    [r1, r2],
                    [c1, c2]
                );
                formula.fucntionboxshow(rf, cf);
            }
        }

        selectTitlesShow(Store.selections, isRestore);

        selectHelpboxFill();

        if (Store.selections.length == 1 && Store.selections[0].row[0] == Store.selections[0].row[1] && Store.selections[0].column[0] == Store.selections[0].column[1]) {
            dynamicArrayHightShow(Store.selections[0].row[0], Store.selections[0].column[0]);
        }
    
        refreshMenuButtonFocus();
    }

    getCurrentFile().luckysheet_select_save = Store.selections;
        const luckysheet_select_save_previous = JSON.stringify(Store.selections);

        if(Store.selections_previous == null |Store.selections_previous !== luckysheet_select_save_previous){
            method.createHookFunction('rangeSelect', getCurrentFile(), Store.selections);
        }
        
        Store.selections_previous = luckysheet_select_save_previous;
}

function selectTitlesShow(rangeArr, isRestore = false) {
    let s = structuredClone(rangeArr);

    let rowTitleMap = {}, columnTitleMap = {};
    for (let i = 0; i < s.length; i++) {
        let r1 = s[i]["row"][0], r2 = s[i]["row"][1], c1 = s[i]["column"][0], c2 = s[i]["column"][1];

        rowTitleMap = selectTitlesMap(rowTitleMap, r1, r2);
        columnTitleMap = selectTitlesMap(columnTitleMap, c1, c2);
    }

    let _elRowsH = document.getElementById("luckysheet-rows-h-selected");
    if (_elRowsH) _elRowsH.innerHTML = '';

    let rowTitleRange = selectTitlesRange(rowTitleMap);
    for (let i = 0; i < rowTitleRange.length; i++) {
        let r1 = rowTitleRange[i][0], r2 = rowTitleRange[i][rowTitleRange[i].length - 1];
        let row = rowLocationByIndex(r2)[1], row_pre = rowLocationByIndex(r1)[0];

        if (_elRowsH) {
            _elRowsH.insertAdjacentHTML('beforeend', '<div class="luckysheet-rows-h-selected" style="top: ' + row_pre + 'px; height: ' + (row - row_pre - 1) + 'px; display: block; background-color: rgba(76, 76, 76, 0.1);"></div>');
        }
    }

    let _elColsH = document.getElementById("luckysheet-cols-h-selected");
    if (_elColsH) _elColsH.innerHTML = '';

    let columnTitleRange = selectTitlesRange(columnTitleMap);
    for (let j = 0; j < columnTitleRange.length; j++) {
        let c1 = columnTitleRange[j][0], c2 = columnTitleRange[j][columnTitleRange[j].length - 1];
        let col = colLocationByIndex(c2)[1], col_pre = colLocationByIndex(c1)[0];

        if (_elColsH) {
            _elColsH.insertAdjacentHTML('beforeend', '<div class="luckysheet-cols-h-selected" style="left: ' + col_pre + 'px; width: ' + (col - col_pre - 1) + 'px; display: block; background-color: rgba(76, 76, 76, 0.1);"></div>');
        }
    }
}
function selectTitlesMap(rangeMap, range1, range2) {
    let map = structuredClone(rangeMap);

    for (let i = range1; i <= range2; i++) {
        if (i in map) {
            continue;
        }

        map[i] = 0;
    }

    return map;
}
function selectTitlesRange(map) {
    let mapArr = [];

    for (let i in map) {
        mapArr.push(i);
    }

    mapArr.sort(function (a, b) { return a - b; });

    let rangeArr = [];
    let item = [];

    if (mapArr.length > 1) {
        for (let j = 1; j < mapArr.length; j++) {
            if (mapArr[j] - mapArr[j - 1] == 1) {
                item.push(mapArr[j - 1]);

                if (j == mapArr.length - 1) {
                    item.push(mapArr[j]);
                    rangeArr.push(item);
                }
            }
            else {
                if (j == 1) {
                    if (j == mapArr.length - 1) {
                        item.push(mapArr[j - 1]);
                        rangeArr.push(item);
                        rangeArr.push([mapArr[j]]);
                    }
                    else {
                        rangeArr.push(mapArr[0]);
                    }
                }
                else if (j == mapArr.length - 1) {
                    item.push(mapArr[j - 1]);
                    rangeArr.push(item);
                    rangeArr.push([mapArr[j]]);
                }
                else {
                    item.push(mapArr[j - 1]);
                    rangeArr.push(item);
                    item = [];
                }
            }
        }
    }
    else {
        rangeArr.push([mapArr[0]]);
    }

    return rangeArr;
}

function selectIsOverlap(range) {
    if (range == null) {
        range = Store.selections;
    }
    range = JSON.parse(JSON.stringify(range));

    let overlap = false;
    let map = {};

    for (let s = 0; s < range.length; s++) {
        let str_r = range[s].row[0],
            end_r = range[s].row[1];
        let str_c = range[s].column[0],
            end_c = range[s].column[1];

        for (let r = str_r; r <= end_r; r++) {
            for (let c = str_c; c <= end_c; c++) {
                if ((r + "_" + c) in map) {
                    overlap = true;
                    break;
                }
                else {
                    map[r + "_" + c] = 0;
                }
            }
        }
    }

    return overlap;
}
function selectionCopyShow(range) {
    selectionCopy.empty();

    if (range == null) {
        range = Store.luckysheet_selection_range;
    }
    range = JSON.parse(JSON.stringify(range));

    if (range.length > 0) {
        for (let s = 0; s < range.length; s++) {
            let r1 = range[s].row[0], r2 = range[s].row[1];
            let c1 = range[s].column[0], c2 = range[s].column[1];

            let row = Store.visibledatarow[r2],
                row_pre = r1 - 1 == -1 ? 0 : Store.visibledatarow[r1 - 1];
            let col = Store.visibleColPositions[c2],
                col_pre = c1 - 1 == -1 ? 0 : Store.visibleColPositions[c1 - 1];

            let copyDomHtml = '<div class="luckysheet-selection-copy" style="display: block; left: ' + col_pre + 'px; width: ' + (col - col_pre - 1) + 'px; top: ' + row_pre + 'px; height: ' + (row - row_pre - 1) + 'px;">' +
                '<div class="luckysheet-selection-copy-top luckysheet-copy"></div>' +
                '<div class="luckysheet-selection-copy-right luckysheet-copy"></div>' +
                '<div class="luckysheet-selection-copy-bottom luckysheet-copy"></div>' +
                '<div class="luckysheet-selection-copy-left luckysheet-copy"></div>' +
                '<div class="luckysheet-selection-copy-hc"></div>' +
                '</div>';
            selectionCopy.append(copyDomHtml);
        }
    }
}

function luckysheet_count_show(left, top, width, height, rowseleted, columnseleted) {
    let rowl = rowseleted[1] - rowseleted[0] + 1,
        coll = columnseleted[1] - columnseleted[0] + 1;
    let drawWidth = Store.luckysheetTableContentHW[0],
        drawHeight = Store.luckysheetTableContentHW[1];
    let scrollWidth = cellMain.getScrollLeft(),
        scrollHeight = cellMain.getScrollTop();

    const _locale = locale();
    const locale_info = _locale.info;

    if (rowl >= 4) {
        let leftv = left - 25;
        if (leftv < 0) {
            leftv = left + 5;
        }

        if (leftv < scrollWidth) {
            leftv = scrollWidth + 10;
        }

        let topv = top + height / 2;
        if (height > drawHeight) {
            topv = scrollHeight + drawHeight / 2;
        }

        countShow.row.showAt({ "left": leftv, "top": topv, "display": "block", "width": "11px" }, "<div>" + rowl.toString().split("").join("</div><div>") + "</div><div>" + locale_info.row + "</div>");
    }
    else {
        countShow.row.hide();
    }

    if (coll >= 4) {
        let topv = top - 25;
        if (topv < 0) {
            topv = top + 5;
        }

        if (topv < scrollHeight) {
            topv = scrollHeight + 10;
        }

        let leftv = left + width / 2;
        if (width > drawWidth) {
            leftv = scrollWidth + drawWidth / 2;
        }

        countShow.column.showAt({ "left": leftv, "top": topv, "display": "block" }, coll + locale_info.column);
    }
    else {
        countShow.column.hide();
    }
}

function selectHelpboxFill() {
    let range = getLastSelection();
    let _focus = getFocusCell();
    let rf = _focus.row, cf = _focus.col;
    let _elHelpboxCell = document.getElementById("luckysheet-formula-input-cell");
    if (!_elHelpboxCell) return;
    if (Store.config["merge"] != null && (rf + "_" + cf) in Store.config["merge"]) {
        _elHelpboxCell.textContent = getRangetxt(Store.currentSheetIndex, {
            column: [cf, cf],
            row: [rf, rf],
        });
    }
    else {
        _elHelpboxCell.textContent = getRangetxt(Store.currentSheetIndex, range);
    }

}

export {
    seletedHighlistByindex,
    selectHightlightShow,
    selectIsOverlap,
    selectionCopyShow,
    luckysheet_count_show,
    selectHelpboxFill
}
